// Repairs only the currently authenticated fictional test account.
const { reviewerClient } = require('./scripts/reviewer-test-client.cjs')

async function fixDemo() {
  const { client, email, password } = reviewerClient()
  const { data, error: authError } = await client.auth.signInWithPassword({ email, password })
  if (authError || !data.user) throw new Error('No se pudo iniciar sesión con la cuenta ficticia.')

  const { error } = await client.from('profiles').upsert({
    id: data.user.id,
    alias: 'Revisor LovIA',
    onboarding_completed: true,
  })
  if (error) throw new Error('No se pudo actualizar el perfil ficticio.')
  console.log('Perfil ficticio actualizado en el proyecto de pruebas.')
}

fixDemo().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
