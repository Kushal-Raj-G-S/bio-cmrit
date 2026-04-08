// Quick Environment Check for KrishiChakra Database Integration
// Run this in browser console while on KrishiChakra page

console.log('🔍 KrishiChakra Environment Check');
console.log('==================================');

// Check if Supabase environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📊 Environment Variables:');
console.log('• Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('• Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

// Check user authentication
const user = window?.localStorage?.getItem('supabase.auth.token');
console.log('• User Token:', user ? '✅ Found' : '❌ Missing');

console.log('\n🎯 To test field creation:');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Click "Add Your First Field"');
console.log('4. Fill form and submit');
console.log('5. Watch for green ✅ success messages');

console.log('\n🌾 Ready for testing!');