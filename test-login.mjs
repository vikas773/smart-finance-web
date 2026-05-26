import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://enthgepnrirbqhikiasn.supabase.co',
  'sb_publishable_J-H5R_hJVKxHU5Du2eR8cg_sy1Q2Mn_'
)

async function testLogin() {
  console.log('Attempting to sign in with demo@finance.com...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'demo@finance.com',
    password: 'demo1234',
  })

  if (signInError) {
    console.log('Sign in error:', signInError.message)
    console.log('Attempting to sign up instead...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'demo@finance.com',
      password: 'demo1234',
      options: { data: { full_name: 'Demo User' } }
    })
    if (signUpError) {
      console.log('Sign up error:', signUpError.message)
    } else {
      console.log('Sign up success:', signUpData)
    }
  } else {
    console.log('Sign in success:', signInData)
  }
}

testLogin()
