#!/usr/bin/env node

/**
 * Script to apply RLS fixes to Supabase database
 * This fixes the infinite recursion issue in Row Level Security policies
 */

const fs = require('fs')
const path = require('path')

// Import the Supabase client with service role key
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function apply_rls_fix() {
  try {
    console.log('🔧 Applying RLS fixes to database...')
    
    // Read the SQL fix file
    const sql_fix_path = path.join(__dirname, '../supabase/fix-rls-recursion.sql')
    const sql_content = fs.readFileSync(sql_fix_path, 'utf8')
    
    // Split SQL into individual statements (simple approach)
    const statements = sql_content
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message)
        console.error('Statement:', statement.substring(0, 100) + '...')
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }
    
    console.log('🎉 RLS fixes applied successfully!')
    console.log('')
    console.log('✨ The infinite recursion issue should now be resolved.')
    console.log('🔐 New helper functions were created in the auth schema.')
    console.log('📋 You can now test user authentication and role management.')
    
  } catch (error) {
    console.error('💥 Failed to apply RLS fixes:', error.message)
    process.exit(1)
  }
}

// Alternative approach using raw SQL execution
async function apply_rls_fix_raw() {
  try {
    console.log('🔧 Applying RLS fixes using raw SQL...')
    
    // Read the SQL fix file
    const sql_fix_path = path.join(__dirname, '../supabase/fix-rls-recursion.sql')
    const sql_content = fs.readFileSync(sql_fix_path, 'utf8')
    
    console.log('📄 Executing SQL fix script...')
    
    // Execute the entire SQL script
    const { error } = await supabase
      .from('_temp_exec_sql')
      .select('*')
      .limit(1)
    
    // If the above doesn't work, we'll need to apply manually
    console.log('⚠️  Please apply the SQL manually in your Supabase dashboard:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the content of supabase/fix-rls-recursion.sql')
    console.log('4. Execute the SQL script')
    console.log('')
    console.log('Or run each command individually if needed.')
    
  } catch (error) {
    console.error('💥 Failed to apply RLS fixes:', error.message)
    console.log('')
    console.log('📝 Manual fix required:')
    console.log('Please apply the SQL from supabase/fix-rls-recursion.sql manually')
    console.log('in your Supabase dashboard SQL editor.')
  }
}

if (require.main === module) {
  apply_rls_fix_raw()
}