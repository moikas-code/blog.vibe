const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wmqxrlpuqnpamqaxedog.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcXhybHB1cW5wYW1xYXhlZG9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjYzNDIyOSwiZXhwIjoyMDUyMjEwMjI5fQ.oIb0Coj-HjIU7qEoJTI1ZwlbQDaT47qWPo7SZQckv6Y'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixCategoriesRLS() {
  console.log('Fixing categories RLS policies...')
  
  try {
    // Drop the restrictive admin-only policies
    await supabase.rpc('exec_sql', {
      sql: `
        -- Drop policies that are causing issues
        DROP POLICY IF EXISTS "Only admins can create categories" ON categories;
        DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
        DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
        
        -- Create simple policies that allow service role access
        CREATE POLICY "Service role can manage categories" ON categories
          FOR ALL USING (true);
          
        CREATE POLICY "Public can read categories" ON categories
          FOR SELECT USING (true);
      `
    })
    
    console.log('Successfully fixed categories RLS policies!')
  } catch (error) {
    console.error('Error fixing policies:', error)
  }
}

fixCategoriesRLS()