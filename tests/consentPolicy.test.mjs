import test from 'node:test'
import assert from 'node:assert/strict'
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import { LEGAL_VERSION, parseLegalAcceptance } from '../src/lib/legalConsentPolicy.ts'

test('only a server receipt for the current legal version confirms acceptance', () => {
  const receipt = { legal_version: LEGAL_VERSION, age_confirmed_18: true, sensitive_data_consent: false, recorded_at: '2026-11-13T13:00:00Z' }
  assert.deepEqual(parseLegalAcceptance(receipt), receipt)
  for (const row of [null, {}, { ...receipt, legal_version: '2026-10-20' }, { ...receipt, age_confirmed_18: false }, { ...receipt, sensitive_data_consent: 'true' }, { ...receipt, recorded_at: 'unknown' }]) assert.throws(() => parseLegalAcceptance(row))
})

test('consent audit and sensitive writes are enforced in disposable PostgreSQL', async t => {
  const db = new PGlite()
  t.after(() => db.close())
  const A = '00000000-0000-4000-8000-000000000001'
  const B = '00000000-0000-4000-8000-000000000002'
  const tables = ['finance_answers', 'evaluations', 'journal_entries', 'assessments_raw', 'assessment_answers', 'emotional_logs']
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE SCHEMA auth; CREATE SCHEMA lovia_private;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${A}'), ('${B}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth,public,lovia_private TO authenticated;
    GRANT USAGE ON SCHEMA auth,public TO anon;
    
  `)
  for (const table of tables) await db.exec(`CREATE TABLE public.${table}(user_id uuid NOT NULL, answer text); ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;
    GRANT SELECT,INSERT,UPDATE,DELETE ON public.${table} TO authenticated;
    CREATE POLICY own ON public.${table} FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());`)
  await db.exec('BEGIN')
  await db.exec(await readFile(new URL('../supabase/migrations/20261113141715_lovia_consentimiento_registrado.sql',import.meta.url),'utf8'))
  await db.exec('COMMIT')
  const asUser = async (id, action, role='authenticated') => {
    await db.exec(`SET ROLE ${role}`)
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[id??''])
    try { return await action() } finally { await db.exec('RESET ROLE') }
  }
  const record = (id, sensitive, version=LEGAL_VERSION, age=true, terms=true) => asUser(id,()=>db.query('SELECT public.record_legal_acceptance($1,$2,$3,$4) AS receipt',[version,terms,age,sensitive]))
  const denied = async action => assert.rejects(action,error=>error.code==='42501')

  await t.test('initial rollout does not change existing-table writes for old clients',async()=>{
    await asUser(A,()=>db.query("INSERT INTO public.finance_answers VALUES($1,'legacy client')",[A]))
    await asUser(A,()=>db.query('DELETE FROM public.finance_answers WHERE user_id=$1',[A]))
    assert.equal((await db.query("SELECT count(*)::int AS n FROM pg_policies WHERE policyname LIKE 'Consentimiento:%respuestas'")).rows[0].n,0)
  })
  // Solo en esta base desechable se verifica la propuesta de activación futura.
  await db.exec(await readFile(new URL('../docs/proposals/consent-sensitive-write-enforcement.sql',import.meta.url),'utf8'))

  await t.test('anonymous, absent users and incomplete acceptance are rejected',async()=>{
    await denied(()=>asUser(null,()=>db.query("SELECT public.record_legal_acceptance('2026-11-13',true,true,true)"),'anon'))
    await denied(()=>record('00000000-0000-4000-8000-000000000099',true))
    for(const args of [[A,true,'old'],[A,true,LEGAL_VERSION,false],[A,true,LEGAL_VERSION,true,false],[A,null]]) await assert.rejects(()=>record(...args),error=>error.code==='22023')
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.legal_acceptance_events')).rows[0].n,0)
  })
  await t.test('declining sensitive data still records terms and age with server time',async()=>{
    const receipt=(await record(A,false)).rows[0].receipt
    assert.equal(receipt.legal_version,LEGAL_VERSION)
    assert.equal(receipt.age_confirmed_18,true)
    assert.equal(receipt.sensitive_data_consent,false)
    assert.ok(Number.isFinite(Date.parse(receipt.recorded_at)))
    assert.ok(!('user_id' in receipt))
    const logs=(await db.query('SELECT consent_type,granted FROM public.legal_acceptance_events WHERE user_id=$1 ORDER BY consent_type',[A])).rows
    assert.deepEqual(logs,[{consent_type:'privacy_v1',granted:true},{consent_type:'sensitive_data_v1',granted:false},{consent_type:'terms_v1',granted:true}])
    await record(A,false)
    assert.equal((await db.query('SELECT count(*)::int AS n FROM public.legal_acceptance_events')).rows[0].n,3)
  })
  await t.test('no sensitive writes are permitted before opt-in, even with direct table access',async()=>{
    for(const table of tables) await denied(()=>asUser(A,()=>db.query(`INSERT INTO public.${table} VALUES($1,'private answer')`,[A])))
  })
  await t.test('A cannot forge or delete evidence, see B state, or write B answers',async()=>{
    await record(B,true)
    for(const table of ['legal_acceptances','legal_acceptance_events']) {
      assert.equal((await asUser(A,()=>db.query(`SELECT * FROM public.${table} WHERE user_id=$1`,[B]))).rows.length,0)
      await denied(()=>asUser(A,()=>db.query(`DELETE FROM public.${table}`)))
      await denied(()=>asUser(A,()=>db.query(`UPDATE public.${table} SET user_id=$1`,[B])))
    }
    for(const table of tables) await denied(()=>asUser(B,()=>db.query(`INSERT INTO public.${table} VALUES($1,'attack')`,[A])))
  })
  await t.test('opt-in allows own writes; revocation blocks future writes while retaining own read/delete',async()=>{
    await record(A,true)
    for(const table of tables) await asUser(A,()=>db.query(`INSERT INTO public.${table} VALUES($1,'private answer')`,[A]))
    const before=(await db.query("SELECT count(*)::int AS n FROM public.legal_acceptance_events WHERE user_id=$1 AND consent_type='terms_v1'",[A])).rows[0].n
    const receipt=(await asUser(A,()=>db.query('SELECT public.set_sensitive_data_consent(false) AS receipt'))).rows[0].receipt
    assert.equal(receipt.sensitive_data_consent,false)
    assert.equal((await db.query("SELECT count(*)::int AS n FROM public.legal_acceptance_events WHERE user_id=$1 AND consent_type='terms_v1'",[A])).rows[0].n,before)
    for(const table of tables) {
      assert.equal((await asUser(A,()=>db.query(`SELECT * FROM public.${table}`))).rows.length,1)
      assert.equal((await asUser(A,()=>db.query(`UPDATE public.${table} SET answer='change' RETURNING *`))).rows.length,0)
      await denied(()=>asUser(A,()=>db.query(`INSERT INTO public.${table} VALUES($1,'new')`,[A])))
      assert.equal((await asUser(A,()=>db.query(`DELETE FROM public.${table} RETURNING *`))).rows.length,1)
    }
  })
})
