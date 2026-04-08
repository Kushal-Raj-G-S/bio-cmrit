const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mjpklbrzusbrocsluoum.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNTc3NywiZXhwIjoyMDc4NzgxNzc3fQ.n3hRBpexiMOmnDtskoMnTBEWOEHc347jX-XCu2HN59E'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createRameshProfile() {
  console.log('👤 Creating Ramesh profile...')
  
  try {
    // First check if profiles table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (tableError && tableError.code === '42P01') {
      console.log('❌ Profiles table does not exist!')
      console.log('🔧 Creating profiles table...')
      
      const { error: createError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );
        `
      })
      
      if (createError) {
        console.error('❌ Failed to create profiles table:', createError)
        return
      }
      
      console.log('✅ Profiles table created')
    }
    
    // Create Ramesh's profile with the ID we've been using
    const rameshId = '485625cc-7f8d-48f3-b293-9b47cb9f6a62'
    
    console.log('🔄 Creating profile for Ramesh...')
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: rameshId,
        full_name: 'Ramesh Sharma',
        email: 'ramesh.sharma@biobloom.com',
        phone: '+91 98765 43210'
      })
      .select()
    
    if (error) {
      console.error('❌ Failed to create profile:', error)
    } else {
      console.log('✅ Successfully created Ramesh profile:', data)
    }
    
    // Now check if community questions exist and fix them
    const { data: questions } = await supabase
      .from('community_questions')
      .select('id, title, author_id')
    
    if (questions && questions.length > 0) {
      console.log(`🔄 Updating ${questions.length} community questions to use Ramesh's profile...`)
      
      for (const question of questions) {
        const { error: updateError } = await supabase
          .from('community_questions')
          .update({ author_id: rameshId })
          .eq('id', question.id)
        
        if (updateError) {
          console.error(`❌ Failed to update question ${question.title}:`, updateError)
        } else {
          console.log(`✅ Updated "${question.title}"`)
        }
      }
    }
    
    // Test the JOIN query
    console.log('\n🧪 Testing JOIN query after setup...')
    const { data: joinedQuestions, error: joinError } = await supabase
      .from('community_questions')
      .select(`
        id,
        title,
        author_id,
        profiles:author_id (
          id,
          full_name,
          email
        )
      `)
      .limit(1)
    
    if (joinError) {
      console.error('❌ JOIN query error:', joinError)
    } else if (joinedQuestions && joinedQuestions.length > 0) {
      const sample = joinedQuestions[0]
      console.log('📊 Sample after setup:')
      console.log('- Title:', sample.title)
      console.log('- Author Profile:', sample.profiles)
      console.log('- Author Name:', sample.profiles?.full_name || 'Still null')
      
      if (sample.profiles?.full_name) {
        console.log('🎉 SUCCESS! Community questions now show real author names!')
      }
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error)
  }
}

createRameshProfile()