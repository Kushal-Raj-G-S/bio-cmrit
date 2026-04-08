const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mjpklbrzusbrocsluoum.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNTc3NywiZXhwIjoyMDc4NzgxNzc3fQ.n3hRBpexiMOmnDtskoMnTBEWOEHc347jX-XCu2HN59E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('Checking existing community tables...\n')
  
  // Check each table
  const tables = ['community_categories', 'community_questions', 'community_votes', 'community_comments']
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`❌ ${table}: Does not exist or no access`)
      console.log(`   Error: ${error.message}`)
    } else {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      console.log(`✅ ${table}: EXISTS (${count || 0} rows)`)
    }
  }
}

checkTables()
