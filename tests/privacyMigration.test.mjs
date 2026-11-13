import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const A = '00000000-0000-4000-8000-000000000001'
const B = '00000000-0000-4000-8000-000000000002'
const ADMIN = '00000000-0000-4000-8000-000000000003'
const MATCH = '00000000-0000-4000-8000-000000000004'
const ABSENT = '00000000-0000-4000-8000-000000000099'

test('privacy migration enforces SQL permissions for A, B, anonymous and admin in disposable PostgreSQL', async t => {
  const db = new PGlite()
  t.after(() => db.close())
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE SCHEMA auth;
    CREATE SCHEMA storage;
    CREATE TABLE storage.buckets (id text PRIMARY KEY, file_size_limit bigint, allowed_mime_types text[]);
    INSERT INTO storage.buckets(id) VALUES ('avatars'), ('books');
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${A}'), ('${B}'), ('${ADMIN}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
    CREATE TABLE public.user_roles (user_id uuid, role text);
    INSERT INTO public.user_roles VALUES ('${ADMIN}', 'admin');
    CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS
      $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin') $$;
    CREATE TABLE public.finance_answers (user_id uuid, question_key text, free_text text);
    INSERT INTO public.finance_answers VALUES ('${A}', 'q1', 'private A'), ('${B}', 'q1', 'private B');
    ALTER TABLE public.finance_answers ENABLE ROW LEVEL SECURITY;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_answers TO authenticated;
    CREATE POLICY own_select ON public.finance_answers FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY own_insert ON public.finance_answers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY own_update ON public.finance_answers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY own_delete ON public.finance_answers FOR DELETE TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Finanzas: admin lee conteos" ON public.finance_answers FOR SELECT TO authenticated USING (public.is_admin());
    CREATE VIEW public.finance_answers_admin_summary AS SELECT user_id, count(*) FROM public.finance_answers GROUP BY user_id;
    GRANT SELECT ON public.finance_answers_admin_summary TO authenticated;
    CREATE TABLE public.matches (id uuid, user_a_id uuid, user_b_id uuid, status text);
    INSERT INTO public.matches VALUES ('${MATCH}', '${A}', '${B}', 'active');
  `)
  await db.exec('BEGIN')
  await db.exec(await readFile(new URL('../supabase/migrations/20261113135116_lovia_privacidad_finanzas_y_ubicacion.sql', import.meta.url), 'utf8'))
  await db.exec('COMMIT')

  const asRole = async (role, id, action) => {
    await db.exec(`SET ROLE ${role}`)
    await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [id ?? ''])
    try { return await action() } finally { await db.exec('RESET ROLE') }
  }
  const denied = async action => assert.rejects(action, error => error.code === '42501')

  await t.test('avatar upload restrictions do not alter shared book storage', async () => {
    const avatar = (await db.query("SELECT * FROM storage.buckets WHERE id='avatars'")).rows[0]
    assert.equal(Number(avatar.file_size_limit), 5242880)
    assert.deepEqual(avatar.allowed_mime_types, ['image/jpeg', 'image/png', 'image/webp'])
    const books = (await db.query("SELECT * FROM storage.buckets WHERE id='books'")).rows[0]
    assert.equal(books.file_size_limit, null)
    assert.equal(books.allowed_mime_types, null)
  })

  await t.test('A and B see their own answers; admin cannot read the other accounts', async () => {
    for (const [id, expected] of [[A, ['private A']], [B, ['private B']], [ADMIN, []]]) {
      const { rows } = await asRole('authenticated', id, () => db.query('SELECT free_text FROM public.finance_answers'))
      assert.deepEqual(rows.map(row => row.free_text), expected)
      await denied(() => asRole('authenticated', id, () => db.query('SELECT * FROM public.finance_answers_admin_summary')))
    }
    await denied(() => asRole('anon', null, () => db.query('SELECT * FROM public.finance_answers')))
  })
  await t.test('A cannot insert, update or delete B answers', async () => {
    await denied(() => asRole('authenticated', A, () => db.query('INSERT INTO public.finance_answers VALUES ($1, $2, $3)', [B, 'q2', 'attack'])))
    assert.equal((await asRole('authenticated', A, () => db.query('UPDATE public.finance_answers SET free_text=$1 WHERE user_id=$2 RETURNING *', ['attack', B]))).rows.length, 0)
    assert.equal((await asRole('authenticated', A, () => db.query('DELETE FROM public.finance_answers WHERE user_id=$1 RETURNING *', [B]))).rows.length, 0)
    assert.equal((await db.query('SELECT free_text FROM public.finance_answers WHERE user_id=$1', [B])).rows[0].free_text, 'private B')
  })
  await t.test('venue function returns no derived location even for match members', async () => {
    for (const id of [A, B, ADMIN]) {
      assert.equal((await asRole('authenticated', id, () => db.query('SELECT public.suggest_safe_venue($1) AS result', [MATCH]))).rows[0].result, null)
    }
    await denied(() => asRole('anon', null, () => db.query('SELECT public.suggest_safe_venue($1)', [MATCH])))
  })
  await t.test('deletion requires authenticated account and explicit confirmation', async () => {
    await denied(() => asRole('anon', null, () => db.query("SELECT public.request_account_deletion('ELIMINAR')")))
    await denied(() => asRole('authenticated', ABSENT, () => db.query("SELECT public.request_account_deletion('ELIMINAR')")))
    await assert.rejects(() => asRole('authenticated', A, () => db.query('SELECT public.request_account_deletion($1)', ['YES'])), error => error.code === '22023')
    await assert.rejects(() => asRole('authenticated', A, () => db.query('SELECT public.request_account_deletion(NULL)')), error => error.code === '22023')
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.account_deletion_requests')).rows[0].n, 0)
  })
  await t.test('requests are idempotent, survive retries and do not delete auth users', async () => {
    const call = id => asRole('authenticated', id, () => db.query("SELECT public.request_account_deletion('ELIMINAR') AS receipt"))
    const first = (await call(A)).rows[0].receipt
    assert.equal(first.status, 'pending')
    assert.deepEqual((await call(A)).rows[0].receipt, first)
    await call(B)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM auth.users')).rows[0].n, 3)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.account_deletion_requests')).rows[0].n, 2)
  })
  await t.test('requests are private to owners, read by admin and cannot be forged by clients', async () => {
    for (const [id, n] of [[A, 1], [B, 1], [ADMIN, 2]]) {
      assert.equal((await asRole('authenticated', id, () => db.query('SELECT * FROM public.account_deletion_requests'))).rows.length, n)
      await denied(() => asRole('authenticated', id, () => db.query("UPDATE public.account_deletion_requests SET status='processing'")))
      await denied(() => asRole('authenticated', id, () => db.query('DELETE FROM public.account_deletion_requests')))
    }
    await denied(() => asRole('authenticated', A, () => db.query('INSERT INTO public.account_deletion_requests(user_id) VALUES ($1)', [ADMIN])))
    await denied(() => asRole('anon', null, () => db.query('SELECT * FROM public.account_deletion_requests')))
    await db.query('DELETE FROM auth.users WHERE id=$1', [A])
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.account_deletion_requests WHERE user_id=$1', [A])).rows[0].n, 0)
  })
})
