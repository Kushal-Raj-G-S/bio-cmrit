const { Pool } = require('pg')
const fs = require('fs')

// Parse the DATABASE_URL correctly
const connectionString = 'postgresql://postgres.mjpklbrzusbrocsluoum:kushalrajgs@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

async function executeSQL() {
  const client = await pool.connect()
  
  try {
    console.log('🔗 Connected to database successfully!')
    
    // Read and execute schema
    console.log('📝 Reading schema file...')
    const schema = fs.readFileSync('./database/education-system-schema.sql', 'utf8')
    
    console.log('🏗️ Executing schema...')
    await client.query(schema)
    console.log('✅ Schema executed successfully!')
    
    // Read and execute sample data
    console.log('📊 Reading sample data file...')
    const sampleData = fs.readFileSync('./database/sample-data-ramesh.sql', 'utf8')
    
    console.log('🌱 Inserting sample data...')
    await client.query(sampleData)
    console.log('✅ Sample data inserted successfully!')
    
    // Verify data
    console.log('🔍 Verifying data...')
    const profileResult = await client.query(
      'SELECT * FROM education_profiles WHERE user_id = $1',
      ['485625cc-7f8d-48f3-b293-9b47cb9f6a62']
    )
    
    if (profileResult.rows.length > 0) {
      console.log('✅ Education profile created:', {
        level: profileResult.rows[0].current_level,
        xp: profileResult.rows[0].total_xp,
        streak: profileResult.rows[0].learning_streak,
        study_hours: profileResult.rows[0].total_study_hours
      })
    }
    
    const coursesResult = await client.query('SELECT COUNT(*) as count FROM courses')
    console.log(`✅ Courses created: ${coursesResult.rows[0].count}`)
    
    const activitiesResult = await client.query(
      'SELECT COUNT(*) as count FROM daily_learning_activities WHERE user_id = $1',
      ['485625cc-7f8d-48f3-b293-9b47cb9f6a62']
    )
    console.log(`✅ Learning activities: ${activitiesResult.rows[0].count}`)
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.detail) {
      console.error('Details:', error.detail)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the setup
executeSQL()