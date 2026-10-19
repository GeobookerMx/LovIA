// Creates a fictional reviewer account in an explicitly selected TEST project.
// Never run against the production project or a real person's address.
const { reviewerClient } = require('./scripts/reviewer-test-client.cjs')

async function setupReviewer() {
  const { client, email, password } = reviewerClient()
  const { error: signUpError } = await client.auth.signUp({
    email, password, options: { data: { alias: 'Revisor LovIA' } },
  })
  if (signUpError) throw new Error('No se pudo crear la cuenta ficticia.')

  const { data, error: authError } = await client.auth.signInWithPassword({ email, password })
  if (authError || !data.user) throw new Error('No se pudo iniciar sesión con la cuenta ficticia.')

  const { error } = await client.from('profiles').upsert({
    id: data.user.id,
    alias: 'Revisor LovIA',
    onboarding_completed: true,
  })
  if (error) throw new Error('No se pudo preparar el perfil ficticio.')
  console.log('Cuenta ficticia de revisión preparada en el proyecto de pruebas.')
}

setupReviewer().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
