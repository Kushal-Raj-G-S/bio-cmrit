// Community Hub Database Seed Data
// Location: src/components/education/community/backend/prisma/seed.js

const { PrismaClient } = require('./generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Community Hub database...');

  // Create sample users
  const users = await Promise.all([
    prisma.communityUser.create({
      data: {
        email: 'john.farmer@example.com',
        username: 'farmerjohn',
        firstName: 'John',
        lastName: 'Smith',
        passwordHash: await bcrypt.hash('password123', 12),
        farmName: 'Green Valley Farm',
        farmSize: 'Large',
        farmType: 'Traditional',
        location: 'Karnataka, India',
        experience: 'Expert',
        specialties: ['Wheat', 'Rice', 'Precision Agriculture'],
        reputation: 1250,
        level: 8,
        isVerified: true,
        bio: 'Experienced farmer specializing in precision agriculture and sustainable farming practices.',
        badges: ['Expert Advisor', 'Problem Solver', 'Community Helper']
      }
    }),
    prisma.communityUser.create({
      data: {
        email: 'sara.organic@example.com',
        username: 'organicsara',
        firstName: 'Sara',
        lastName: 'Johnson',
        passwordHash: await bcrypt.hash('password123', 12),
        farmName: 'Sunrise Organic Farm',
        farmSize: 'Medium',
        farmType: 'Organic',
        location: 'Punjab, India',
        experience: 'Intermediate',
        specialties: ['Organic Farming', 'Soil Health', 'Pest Control'],
        reputation: 800,
        level: 6,
        isVerified: true,
        isModerator: true,
        bio: 'Organic farming advocate with expertise in natural pest control and soil health.',
        badges: ['Organic Expert', 'Soil Specialist', 'Moderator']
      }
    }),
    prisma.communityUser.create({
      data: {
        email: 'mike.tech@example.com',
        username: 'techfarmer',
        firstName: 'Mike',
        lastName: 'Patel',
        passwordHash: await bcrypt.hash('password123', 12),
        farmName: 'Smart Farming Solutions',
        farmSize: 'Small',
        farmType: 'Mixed',
        location: 'Gujarat, India',
        experience: 'Intermediate',
        specialties: ['IoT', 'Drone Technology', 'Data Analytics'],
        reputation: 650,
        level: 5,
        bio: 'Technology enthusiast implementing IoT and AI solutions in farming.',
        badges: ['Tech Innovator', 'Early Adopter']
      }
    }),
    prisma.communityUser.create({
      data: {
        email: 'anna.newbie@example.com',
        username: 'newfarmer',
        firstName: 'Anna',
        lastName: 'Kumar',
        passwordHash: await bcrypt.hash('password123', 12),
        farmSize: 'Small',
        farmType: 'Traditional',
        location: 'Tamil Nadu, India',
        experience: 'Beginner',
        specialties: ['Vegetables', 'Learning'],
        reputation: 50,
        level: 1,
        bio: 'New to farming, eager to learn from the community.',
        badges: ['New Member']
      }
    })
  ]);

  console.log('✅ Created sample users');

  // Get categories (they should already exist from server initialization)
  const categories = await prisma.category.findMany();
  
  if (categories.length === 0) {
    console.log('Creating default categories...');
    await Promise.all([
      prisma.category.create({
        data: { name: 'Urgent Help', description: 'Time-sensitive farming issues', icon: 'AlertTriangle', color: '#EF4444', order: 1 }
      }),
      prisma.category.create({
        data: { name: 'Pest Control', description: 'Pest management strategies', icon: 'Bug', color: '#F59E0B', order: 2 }
      }),
      prisma.category.create({
        data: { name: 'Soil Health', description: 'Soil improvement techniques', icon: 'Mountain', color: '#8B5CF6', order: 3 }
      }),
      prisma.category.create({
        data: { name: 'Success Stories', description: 'Share your achievements', icon: 'Trophy', color: '#10B981', order: 4 }
      })
    ]);
  }

  const finalCategories = await prisma.category.findMany();

  // Create sample questions
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        title: 'URGENT: Tomato plants showing white spots - possible blight?',
        content: `My tomato plants have developed white spots on leaves over the past 2 days. The spots are spreading quickly and some leaves are turning yellow. I'm worried this might be late blight. 

The weather has been humid and we had rain 3 days ago. Plants are about 6 weeks old and were doing well until now.

What should I do immediately to save my crop? Is this blight or something else?`,
        tags: ['tomato', 'blight', 'disease', 'urgent', 'white-spots'],
        isUrgent: true,
        authorId: users[3].id, // Anna (newbie)
        categoryId: finalCategories.find(c => c.name === 'Urgent Help')?.id || finalCategories[0].id,
        viewCount: 45,
        voteScore: 3
      }
    }),
    prisma.question.create({
      data: {
        title: 'Best practices for improving clay soil drainage?',
        content: `I have a 5-acre field with heavy clay soil that gets waterlogged during monsoon. Water stands for days after heavy rain, affecting crop growth.

I've heard about adding organic matter and creating drainage channels, but I'd like to know:
1. What specific amendments work best for clay soil?
2. How much organic matter should I add per acre?
3. Are there any cost-effective drainage solutions?

Any experiences with similar soil conditions would be helpful!`,
        tags: ['soil', 'drainage', 'clay-soil', 'monsoon', 'organic-matter'],
        authorId: users[2].id, // Mike
        categoryId: finalCategories.find(c => c.name === 'Soil Health')?.id || finalCategories[0].id,
        viewCount: 78,
        voteScore: 8
      }
    }),
    prisma.question.create({
      data: {
        title: 'Success Story: 40% yield increase with precision agriculture!',
        content: `I wanted to share my experience implementing precision agriculture techniques on my 50-acre wheat farm this season.

**What I implemented:**
- Variable rate fertilizer application based on soil testing
- GPS-guided tractors for precise planting
- Drone monitoring for pest and disease detection
- Soil moisture sensors for irrigation optimization

**Results:**
- 40% increase in yield compared to last year
- 25% reduction in fertilizer costs
- 30% water savings
- Better crop uniformity across the field

**Investment:** ₹8 lakhs for equipment and technology
**ROI:** Payback period of 2.5 years

Happy to answer questions about the implementation process!`,
        tags: ['precision-agriculture', 'success-story', 'technology', 'yield-increase', 'roi'],
        authorId: users[0].id, // John (expert)
        categoryId: finalCategories.find(c => c.name === 'Success Stories')?.id || finalCategories[0].id,
        viewCount: 156,
        voteScore: 15,
        isPinned: true
      }
    }),
    prisma.question.create({
      data: {
        title: 'Effective organic methods for aphid control in vegetables?',
        content: `My vegetable garden (mainly okra, tomatoes, and chilies) is being attacked by aphids. I prefer organic methods and want to avoid chemical pesticides.

I've tried neem oil spray but the infestation keeps returning. Looking for:
- Other organic treatment options
- Preventive measures
- Companion planting suggestions
- Beneficial insects that can help

The infestation is moderate but spreading. Plants are still healthy otherwise.`,
        tags: ['aphids', 'organic', 'vegetables', 'pest-control', 'neem'],
        authorId: users[1].id, // Sara (organic expert)
        categoryId: finalCategories.find(c => c.name === 'Pest Control')?.id || finalCategories[0].id,
        viewCount: 92,
        voteScore: 6
      }
    })
  ]);

  console.log('✅ Created sample questions');

  // Create sample comments
  await Promise.all([
    // Comments on tomato blight question
    prisma.comment.create({
      data: {
        content: `This looks like early blight (Alternaria) rather than late blight. The white spots with dark rings are characteristic.

**Immediate actions:**
1. Remove affected leaves immediately and dispose of them away from the garden
2. Apply copper-based fungicide spray
3. Improve air circulation around plants
4. Water at soil level, not on leaves

**Prevention:**
- Mulch around plants to prevent soil splash
- Space plants properly for good air flow
- Apply preventive fungicide every 7-10 days during humid weather

You can still save your crop if you act quickly!`,
        authorId: users[1].id, // Sara (expert)
        questionId: questions[0].id,
        isByExpert: true,
        isAccepted: true,
        voteScore: 8
      }
    }),
    // Reply to the above comment
    prisma.comment.create({
      data: {
        content: `Thank you so much! I've removed the affected leaves and applied copper fungicide. Already seeing improvement after 2 days. The air circulation tip was especially helpful - I had planted them too close together.`,
        authorId: users[3].id, // Anna
        questionId: questions[0].id,
        voteScore: 2
      }
    }),
    // Comment on clay soil question
    prisma.comment.create({
      data: {
        content: `I had similar issues with my 10-acre field. Here's what worked for me:

**Organic amendments (per acre):**
- 2-3 tons of compost or well-rotted manure
- 500 kg of coarse sand (river sand, not fine sand)
- 200 kg of rice husk or wheat straw

**Drainage solution:**
- Created 2-foot deep drainage channels every 50 meters
- Installed French drains in lowest areas
- Cost about ₹15,000 per acre but worth it

**Timeline:** Saw significant improvement after one monsoon season. Soil structure much better now and no waterlogging even during heavy rains.

Investment was around ₹25,000 per acre but the improved yields have paid for it within 2 years.`,
        authorId: users[0].id, // John
        questionId: questions[1].id,
        isByExpert: true,
        voteScore: 12
      }
    }),
    // Comment on success story
    prisma.comment.create({
      data: {
        content: `Impressive results! I'm particularly interested in the drone monitoring aspect. Which drone model did you use and what software for analysis? Also, how often do you fly for monitoring?

The ROI seems very attractive. I have a 30-acre farm and considering similar investment.`,
        authorId: users[2].id, // Mike
        questionId: questions[2].id,
        voteScore: 5
      }
    }),
    // Comment on aphid control
    prisma.comment.create({
      data: {
        content: `Try these organic methods that work well for me:

**Immediate treatment:**
- Insecticidal soap spray (1 tbsp dish soap per liter water)
- Ladybug release - they eat 50+ aphids per day
- Companion planting: marigolds, nasturtiums, catnip

**DIY spray recipe:**
- 2 tbsp neem oil
- 1 tbsp liquid soap
- 1 liter water
- Spray early morning or evening

**Prevention:**
- Plant garlic and onions around vegetables
- Encourage beneficial insects with diverse flowering plants
- Avoid over-fertilizing with nitrogen (attracts aphids)

This approach has kept my organic farm aphid-free for 3 seasons!`,
        authorId: users[1].id, // Sara
        questionId: questions[3].id,
        isByExpert: true,
        isAccepted: true,
        voteScore: 10
      }
    })
  ]);

  console.log('✅ Created sample comments');

  // Create some votes
  await Promise.all([
    // Votes on questions
    prisma.vote.create({ data: { type: 'UP', userId: users[0].id, questionId: questions[1].id } }),
    prisma.vote.create({ data: { type: 'UP', userId: users[1].id, questionId: questions[1].id } }),
    prisma.vote.create({ data: { type: 'UP', userId: users[2].id, questionId: questions[2].id } }),
    prisma.vote.create({ data: { type: 'UP', userId: users[3].id, questionId: questions[2].id } }),
  ]);

  console.log('✅ Created sample votes');

  // Create some follows
  await Promise.all([
    prisma.follow.create({ data: { followerId: users[3].id, followingId: users[0].id } }),
    prisma.follow.create({ data: { followerId: users[3].id, followingId: users[1].id } }),
    prisma.follow.create({ data: { followerId: users[2].id, followingId: users[0].id } }),
  ]);

  console.log('✅ Created sample follows');

  console.log(`
🎉 Community Hub database seeded successfully!

📊 Created:
- 4 Users (1 expert, 1 moderator, 1 intermediate, 1 beginner)
- 7 Categories
- 4 Questions (including 1 urgent, 1 success story)
- 5 Comments (including expert answers)
- Sample votes and follows

🔑 Test Login Credentials:
Expert: john.farmer@example.com / password123
Moderator: sara.organic@example.com / password123
Tech User: mike.tech@example.com / password123
Beginner: anna.newbie@example.com / password123

🚀 Your Community Hub is ready to use!
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
