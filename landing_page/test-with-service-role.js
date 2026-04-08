const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mjpklbrzusbrocsluoum.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNTc3NywiZXhwIjoyMDc4NzgxNzc3fQ.n3hRBpexiMOmnDtskoMnTBEWOEHc347jX-XCu2HN59E'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWithServiceRole() {
  console.log('🔧 Testing with service role (bypassing RLS)...')
  
  try {
    // Test profiles access
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('📋 Profiles found:', profiles?.length || 0)
    if (profiles && profiles.length > 0) {
      profiles.forEach(p => console.log(`- ${p.full_name} (${p.id})`))
    }
    
    // Test community questions
    const { data: questions, error: questionError } = await supabase
      .from('community_questions')
      .select('id, title, author_id')
      .limit(5)
    
    console.log('📋 Questions found:', questions?.length || 0)
    
    // Test the JOIN query (like our API uses)
    const { data: joinedData, error: joinError } = await supabase
      .from('community_questions')
      .select(`
        id,
        title,
        content,
        author_id,
        profiles:author_id (
          id,
          full_name,
          email,
          phone
        ),
        community_categories:category_id (
          id,
          name,
          description,
          icon,
          color
        )
      `)
      .limit(2)
    
    if (joinError) {
      console.error('❌ JOIN error:', joinError)
    } else {
      console.log('\n✅ JOIN query successful!')
      joinedData?.forEach(q => {
        console.log(`📄 "${q.title}"`)
        console.log(`   👤 Author: ${q.profiles?.full_name || 'NULL'}`)
        console.log(`   🏷️ Category: ${q.community_categories?.name || 'NULL'}`)
      })
      
      const hasValidAuthors = joinedData?.some(q => q.profiles?.full_name)
      if (hasValidAuthors) {
        console.log('\n🎉 SUCCESS! The JOIN query is working and returning author names!')
      } else {
        console.log('\n⚠️ JOIN query works but no author names found')
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testWithServiceRole()