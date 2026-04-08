const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mjpklbrzusbrocsluoum.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNTc3NywiZXhwIjoyMDc4NzgxNzc3fQ.n3hRBpexiMOmnDtskoMnTBEWOEHc347jX-XCu2HN59E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVoting() {
  console.log('Testing community features...\n')
  
  // Get a question
  const { data: questions } = await supabase
    .from('community_questions')
    .select('id, title, vote_count, views')
    .limit(1)
  
  if (!questions || questions.length === 0) {
    console.log('No questions found')
    return
  }
  
  const question = questions[0]
  console.log(`📝 Question: ${question.title}`)
  console.log(`   Current votes: ${question.vote_count || 0}`)
  console.log(`   Current views: ${question.views || 0}\n`)
  
  // Simulate an upvote
  const testUserId = 'dev-user'
  
  console.log('Testing upvote...')
  const { data: vote, error: voteError } = await supabase
    .from('community_votes')
    .upsert({
      user_id: testUserId,
      question_id: question.id,
      vote_type: 'up'
    })
    .select()
  
  if (voteError) {
    console.log(`❌ Vote failed: ${voteError.message}`)
  } else {
    console.log(`✅ Vote recorded!`)
    
    // Update vote count
    await supabase
      .from('community_questions')
      .update({ vote_count: (question.vote_count || 0) + 1 })
      .eq('id', question.id)
    
    console.log(`✅ Vote count updated to ${(question.vote_count || 0) + 1}`)
  }
  
  // Simulate view tracking
  console.log('\nTesting view tracking...')
  const { error: viewError } = await supabase
    .from('community_questions')
    .update({ views: (question.views || 0) + 1 })
    .eq('id', question.id)
  
  if (viewError) {
    console.log(`❌ View tracking failed: ${viewError.message}`)
  } else {
    console.log(`✅ View count updated to ${(question.views || 0) + 1}`)
  }
}

testVoting()
