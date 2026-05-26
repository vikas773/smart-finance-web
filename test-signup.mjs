import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://enthgepnrirbqhikiasn.supabase.co',
  'sb_publishable_J-H5R_hJVKxHU5Du2eR8cg_sy1Q2Mn_'
)

async function testSignup() {
  const email = `test_${Date.now()}@finance.com`
  console.log(`Attempting to sign up with ${email}...`)
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: { data: { full_name: 'Test User' } }
  })
  
  if (error) {
    console.log('Sign up error:', error.message)
  } else {
    console.log('Sign up success! User ID:', data.user?.id)
    if (data.session) {
      console.log('Session was created successfully. Email confirmation is OFF.')
    } else {
      console.log('Session is null. Email confirmation is still ON or requires manual confirmation.')
    }
  }
}

testSignup()
