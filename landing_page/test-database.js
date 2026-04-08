// Test database connection and check if field_batches table exists
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test 1: Check if field_batches table exists
    console.log('\n📋 Checking field_batches table...')
    const { data, error } = await supabase
      .from('field_batches')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ field_batches table does not exist:', error.message)
      console.log('📝 You need to run the SQL migration to create the table')
    } else {
      console.log('✅ field_batches table exists with', data.length, 'records')
    }
    
    // Test 2: Check profiles table
    console.log('\n👤 Checking profiles table...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')  
      .select('id, full_name, email')
      .limit(5)
    
    if (profileError) {
      console.log('❌ profiles table error:', profileError.message)
    } else {
      console.log('✅ profiles table exists with users:')
      profileData.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.email})`)
      })
    }
    
  } catch (err) {
    console.log('❌ Database connection error:', err.message)
  }
}

testDatabase()