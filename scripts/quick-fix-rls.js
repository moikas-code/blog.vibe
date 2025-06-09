// Quick fix for RLS policies
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wmqxrlpuqnpamqaxedog.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcXhybHB1cW5wYW1xYXhlZG9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjYzNDIyOSwiZXhwIjoyMDUyMjEwMjI5fQ.oIb0Coj-HjIU7qEoJTI1ZwlbQDaT47qWPo7SZQckv6Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function quickFix() {
  console.log('Applying quick RLS fix...')
  
  // First, let's try to create a test category to see what happens
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: 'Test Category',
      slug: 'test-category',
      description: 'A test category'
    })
    .select()
    .single()
  
  if (error) {
    console.log('Error creating category:', error)
    console.log('This confirms the RLS issue')
  } else {
    console.log('Category created successfully:', data)
    // Clean up the test category
    await supabase.from('categories').delete().eq('slug', 'test-category')
  }
}

quickFix()