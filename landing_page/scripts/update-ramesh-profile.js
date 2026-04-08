const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mjpklbrzusbrocsluoum.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNTc3NywiZXhwIjoyMDc4NzgxNzc3fQ.n3hRBpexiMOmnDtskoMnTBEWOEHc347jX-XCu2HN59E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateRameshProfile() {
  console.log('🔧 Updating Ramesh Sharma profile to realistic farmer data...\n')
  
  const userId = '485625cc-7f8d-48f3-b293-9b47cb9f6a62'
  
  // Update profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: 'Ramesh Kumar Sharma',
      bio: 'Traditional farmer with 15 years of experience in paddy and wheat cultivation. Passionate about organic farming and sustainable agriculture practices.',
      experience_years: '10-20',
      farm_name: 'Sharma Krishi Farm',
      farm_size: 'medium',
      primary_crops: ['Rice', 'Wheat', 'Sugarcane'],
      city: 'Devanahalli',
      district: 'Bangalore Rural',
      state: 'Karnataka',
      pincode: '562110',
      phone_verified: true,
      onboarding_complete: true,
      onboarding_step: 5,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
  
  if (profileError) {
    console.error('❌ Profile update failed:', profileError.message)
    return
  }
  
  console.log('✅ Profile updated successfully!')
  console.log('   Name:', profile[0].full_name)
  console.log('   Farm:', profile[0].farm_name)
  console.log('   Location:', `${profile[0].city}, ${profile[0].district}, ${profile[0].state}`)
  console.log('   Crops:', profile[0].primary_crops.join(', '))
  console.log('   Experience:', profile[0].experience_years, 'years')
  
  // Update questions to be more realistic
  console.log('\n📝 Updating community questions...')
  
  const { data: questions } = await supabase
    .from('community_questions')
    .select('id, title')
    .eq('author_id', userId)
  
  if (questions && questions.length > 0) {
    const updates = [
      {
        id: questions[0].id,
        title: 'Aphid infestation in wheat crops - need urgent organic solution',
        content: 'Namaste farmers! I am facing severe aphid attack on my 3 acre wheat field. The infestation started last week and is spreading fast. I prefer organic methods. Has anyone tried neem oil spray? What concentration works best? Please share your experience. Thanks!'
      },
      {
        id: questions[1]?.id,
        title: 'High soil pH (8.2) affecting paddy growth - best way to reduce it?',
        content: 'My soil test shows pH level of 8.2 which is too alkaline for paddy cultivation. The crop growth is slow and leaves are turning yellow. I tried adding organic compost but no improvement yet. Should I use sulfur or gypsum? How much quantity per acre? Please guide.'
      },
      {
        id: questions[2]?.id,
        title: 'Drip irrigation vs sprinkler for 5 acre sugarcane farm - which is better?',
        content: 'Planning to install irrigation system for my 5 acre sugarcane farm in Devanahalli. Water table is 40 feet deep. Confused between drip and sprinkler. Which one is more water efficient and cost effective? What is the maintenance cost? Please share your suggestions based on real experience.'
      }
    ]
    
    for (const update of updates.filter(u => u.id)) {
      await supabase
        .from('community_questions')
        .update({
          title: update.title,
          content: update.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id)
      
      console.log(`   ✅ Updated: "${update.title.substring(0, 50)}..."`)
    }
  }
  
  // Show final profile
  console.log('\n📊 FINAL PROFILE:')
  console.log('=' .repeat(60))
  
  const { data: finalProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  console.log('   👤 Name:', finalProfile.full_name)
  console.log('   📱 Phone:', finalProfile.phone)
  console.log('   🏠 Farm:', finalProfile.farm_name, `(${finalProfile.farm_size})`)
  console.log('   🌾 Crops:', finalProfile.primary_crops.join(', '))
  console.log('   📍 Location:', `${finalProfile.city}, ${finalProfile.district}, ${finalProfile.state} - ${finalProfile.pincode}`)
  console.log('   ⏱️  Experience:', finalProfile.experience_years, 'years')
  console.log('   ✅ Phone Verified:', finalProfile.phone_verified)
  console.log('   ✅ Onboarding Complete:', finalProfile.onboarding_complete)
  console.log('   📝 Bio:', finalProfile.bio)
  
  console.log('\n🎉 Ramesh Sharma is now a realistic demo user!')
  console.log('   Login with: +91 9686293233')
  console.log('   OTP will be sent via Twilio')
}

updateRameshProfile().catch(console.error)
