const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mjpklbrzusbrocsluoum.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMDU3NzcsImV4cCI6MjA3ODc4MTc3N30.cpDeYIbRxAREsqJRYiUl5p93rixbAkNz2qOI5v_a3gE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixOrphanedQuestions() {
  console.log('🔧 Fixing orphaned community questions...')
  
  try {
    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
    
    console.log(`📋 Found ${profiles?.length || 0} profiles`)
    
    if (!profiles || profiles.length === 0) {
      console.log('❌ No profiles found - cannot fix questions')
      return
    }
    
    // Get all questions
    const { data: questions } = await supabase
      .from('community_questions')
      .select('id, title, author_id')
    
    console.log(`📋 Found ${questions?.length || 0} questions`)
    
    // Find orphaned questions (questions with author_id that doesn't exist in profiles)
    const orphanedQuestions = questions?.filter(q => 
      !profiles.some(p => p.id === q.author_id)
    ) || []
    
    console.log(`⚠️ Found ${orphanedQuestions.length} orphaned questions`)
    
    if (orphanedQuestions.length > 0) {
      const rameshProfile = profiles.find(p => p.full_name?.includes('Ramesh')) || profiles[0]
      console.log(`🎯 Will assign orphaned questions to: ${rameshProfile.full_name}`)
      
      for (const question of orphanedQuestions) {
        console.log(`🔄 Fixing question: "${question.title}"`)
        
        const { error } = await supabase
          .from('community_questions')
          .update({ author_id: rameshProfile.id })
          .eq('id', question.id)
        
        if (error) {
          console.error(`❌ Failed to update ${question.title}:`, error)
        } else {
          console.log(`✅ Updated "${question.title}"`)
        }
      }
    }
    
    // Now test the JOIN query
    console.log('\n🧪 Testing JOIN query after fix...')
    const { data: joinedQuestions, error } = await supabase
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
    
    if (error) {
      console.error('❌ JOIN query error:', error)
    } else {
      const sample = joinedQuestions[0]
      console.log('📊 Sample after fix:')
      console.log('- Title:', sample.title)
      console.log('- Author Profile:', sample.profiles)
      console.log('- Author Name:', sample.profiles?.full_name || 'Still null')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixOrphanedQuestions()