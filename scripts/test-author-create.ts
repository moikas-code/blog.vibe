import { createClient } from '@supabase/supabase-js'

// Use your production Supabase credentials here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthorCreation() {
  const authorData = {
    clerk_id: 'user_2yFd566gvYDQrTKfgSUxRYVnDrC',
    name: 'Warren Gates',
    avatar_url: 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yeUZTODcwZEo2Qmo3YXhkUHdyNGJVeGg2ZlMiLCJyaWQiOiJ1c2VyXzJ5RmQ1NjZndllEUXJUS2ZnU1V4UllWbkRyQyIsImluaXRpYWxzIjoiV0cifQ'
  }

  console.log('Attempting to create author:', authorData)

  const { data, error } = await supabase
    .from('authors')
    .upsert(authorData, { onConflict: 'clerk_id' })
    .select()
    .single()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Success:', data)
  }
}

testAuthorCreation()