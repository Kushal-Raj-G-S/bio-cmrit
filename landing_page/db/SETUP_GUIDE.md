# 🚀 BioBloom Database Complete Reset & Setup

## ⚠️ IMPORTANT: This will DELETE ALL existing data!

Follow these steps **in exact order** to completely reset your database.

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your BioBloom project
3. Click **Database** → **SQL Editor** (left sidebar)
4. Click **New Query** button

---

### Step 2: Clean Up (Delete Everything)

1. **Open** `db/000_cleanup.sql` in VS Code
2. **Copy** the entire content
3. **Paste** into Supabase SQL Editor
4. Click **RUN** button
5. Wait for ✅ "Success. No rows returned"

**What this does:**
- Drops all RLS policies
- Drops all triggers
- Drops all functions
- Drops all indexes
- Drops the profiles table
- Removes everything database-related

---

### Step 3: Create Fresh Schema

1. **Open** `db/001_profiles_schema.sql` in VS Code
2. **Copy** the entire content
3. **Paste** into Supabase SQL Editor
4. Click **RUN** button
5. Wait for ✅ Success message

**What this creates:**
- `profiles` table with all columns
- Indexes for fast queries
- Auto-update timestamp trigger
- RLS (Row Level Security) policies
- Auto-create profile trigger (handles phone & email signups)

---

### Step 4: Verify Database Setup

Run this query in SQL Editor:

```sql
-- Check if table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

You should see all 22 columns listed.

Then run:

```sql
-- Check if triggers exist
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'update_profiles_updated_at');
```

You should see 2 triggers.

---

### Step 5: Enable Phone Authentication

**CRITICAL: Required for signup to work!**

1. In Supabase Dashboard, go to: **Authentication** → **Providers**
2. Scroll down to **Phone** provider
3. Click **Enable**
4. Choose your SMS provider:
   - **Recommended for India**: Twilio
   - Add your Twilio Account SID
   - Add your Twilio Auth Token
   - Add your Twilio Phone Number
5. Set template for India: `+91XXXXXXXXXX`
6. Click **Save**

**Without this step, OTP will not be sent!**

---

### Step 6: Test the Complete Flow

#### Test 1: Phone Signup
1. Go to `http://localhost:3000/auth`
2. Click "Don't have an account? Sign up"
3. Enter phone: `9876543210`
4. Click "Send OTP"
5. Check your phone for OTP
6. Enter the 6-digit OTP
7. Click "Verify & Continue"
8. **Expected:** Redirect to `/onboarding`

#### Test 2: Verify Database Created Profile
Run in SQL Editor:
```sql
SELECT id, phone, phone_verified, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected result:** 1 row with:
- `phone`: `+919876543210`
- `phone_verified`: `true`
- `created_at`: current timestamp

#### Test 3: Complete Onboarding

1. **Step 0**: Fill in name, email, password (optional)
   - Click "Save & Continue"
2. **Step 1**: Select farming experience, write bio
   - Click "Next"
3. **Step 2**: Enter farm name, size, crops
   - Click "Next"
4. **Step 3**: Enter city, district, state, pincode
   - Click "Next"
5. **Step 4**: Review and click "Complete Onboarding"
6. **Expected:** Redirect to `/dashboard`

#### Test 4: Verify Complete Profile Data
Run in SQL Editor:
```sql
SELECT 
  full_name,
  email,
  phone,
  phone_verified,
  farm_name,
  farm_size,
  primary_crops,
  city,
  state,
  onboarding_complete,
  onboarding_step
FROM profiles 
WHERE phone = '+919876543210';
```

**Expected:** 1 row with ALL your data populated!

---

## 📊 Database Schema Reference

### profiles Table Structure

| Column | Type | Example | Required |
|--------|------|---------|----------|
| `id` | UUID | `a1b2c3...` | ✅ (auto) |
| `full_name` | TEXT | `Rajesh Kumar` | After step 0 |
| `email` | TEXT | `farmer@example.com` | After step 0 |
| `phone` | TEXT | `+919876543210` | ✅ (from auth) |
| `bio` | TEXT | `Growing wheat for 15 years...` | After step 1 |
| `avatar_url` | TEXT | `https://...` | Optional |
| `experience_years` | TEXT | `11-20` | After step 1 |
| `farm_name` | TEXT | `Green Valley Farms` | After step 2 |
| `farm_size` | TEXT | `medium` | After step 2 |
| `primary_crops` | TEXT | `Wheat, Rice, Cotton` | After step 2 |
| `city` | TEXT | `Pune` | After step 3 |
| `district` | TEXT | `Pune` | After step 3 |
| `state` | TEXT | `Maharashtra` | After step 3 |
| `pincode` | TEXT | `411001` | After step 3 |
| `phone_verified` | BOOLEAN | `true` | ✅ (auto) |
| `aadhaar_verified` | BOOLEAN | `false` | Future |
| `aadhaar_last_4` | TEXT | `1234` | Future |
| `verified_at` | TIMESTAMP | `2024-...` | Auto |
| `onboarding_complete` | BOOLEAN | `true` | After step 4 |
| `onboarding_step` | INTEGER | `5` | Auto (0-5) |
| `created_at` | TIMESTAMP | `2024-...` | ✅ (auto) |
| `updated_at` | TIMESTAMP | `2024-...` | ✅ (auto) |

---

## 🔒 Security Features

### Row Level Security (RLS)
✅ **Enabled** - Users can ONLY access their own data

**Policies:**
1. `Users can view own profile` - SELECT only your data
2. `Users can insert own profile` - INSERT only your data
3. `Users can update own profile` - UPDATE only your data
4. `Users can delete own profile` - DELETE only your data

### Triggers
1. **on_auth_user_created** (on `auth.users`)
   - Fires when user signs up via phone OTP
   - Auto-creates row in `profiles` table
   - Sets `phone` and `phone_verified` automatically

2. **update_profiles_updated_at** (on `profiles`)
   - Fires on every UPDATE
   - Auto-updates `updated_at` timestamp

---

## 🛠️ Useful SQL Queries

### View Your Profile
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

### Check All Profiles (Admin)
```sql
SELECT full_name, phone, email, onboarding_complete, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

### Find Incomplete Onboardings
```sql
SELECT full_name, phone, onboarding_step 
FROM profiles 
WHERE onboarding_complete = false;
```

### Reset Onboarding for Testing
```sql
UPDATE profiles 
SET 
  onboarding_complete = false,
  onboarding_step = 0,
  full_name = NULL,
  email = NULL,
  bio = NULL,
  farm_name = NULL,
  farm_size = NULL,
  primary_crops = NULL,
  city = NULL,
  district = NULL,
  state = NULL,
  pincode = NULL
WHERE phone = '+919876543210';
```

### Delete Specific Profile
```sql
DELETE FROM profiles WHERE phone = '+919876543210';
-- Note: This will also delete from auth.users (CASCADE)
```

### Find Duplicate Profiles (if any)
```sql
SELECT phone, COUNT(*) as count
FROM profiles 
GROUP BY phone 
HAVING COUNT(*) > 1;
```

### Delete Old Duplicates (keep latest)
```sql
DELETE FROM profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (phone) id 
  FROM profiles 
  ORDER BY phone, created_at DESC
);
```

---

## 🐛 Troubleshooting

### Issue: OTP not sending

**Symptoms:** Click "Send OTP" but no SMS received

**Solutions:**
1. Check Supabase Logs: **Logs** → **Auth Logs**
2. Verify phone provider is **enabled** in Settings
3. Check Twilio credentials are correct
4. Ensure phone format: `+919876543210` (with +91)
5. Test Twilio directly in their console

---

### Issue: "Profile not found" error

**Symptoms:** After phone verification, shows "Profile not found"

**Solution:** Trigger didn't fire. Manually create profile:
```sql
-- Get user ID from auth.users
SELECT id, phone FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Manually insert profile (replace USER_ID)
INSERT INTO profiles (id, phone, phone_verified, created_at)
VALUES (
  'USER_ID_HERE', 
  '+919876543210', 
  true, 
  NOW()
);
```

---

### Issue: Duplicate profiles

**Symptoms:** Same phone number appears twice

**Solution:** Run cleanup query:
```sql
-- Find duplicates
SELECT phone, COUNT(*) 
FROM profiles 
GROUP BY phone 
HAVING COUNT(*) > 1;

-- Delete old ones (keep newest)
DELETE FROM profiles 
WHERE id NOT IN (
  SELECT DISTINCT ON (phone) id 
  FROM profiles 
  ORDER BY phone, created_at DESC
);
```

---

### Issue: "Session expired" in onboarding

**Symptoms:** After phone verification, onboarding says "Session expired"

**Solution:** Check if user is authenticated:
```sql
-- Run this in Supabase SQL Editor (while logged in)
SELECT auth.uid();
```

If NULL, re-login via phone OTP in `/auth`

---

### Issue: RLS policy blocks access

**Symptoms:** "permission denied for table profiles"

**Solution:** This is **correct behavior**! RLS is working.
- Must be authenticated as that user to access their profile
- Use `auth.uid()` in queries when testing
- Or disable RLS temporarily for testing:
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable after testing!
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] `profiles` table exists with 22 columns
- [ ] RLS is enabled (`SELECT * FROM pg_tables WHERE tablename = 'profiles'` shows `rowsecurity = true`)
- [ ] Trigger `on_auth_user_created` exists
- [ ] Trigger `update_profiles_updated_at` exists
- [ ] Phone authentication is enabled in Supabase
- [ ] Can signup with phone OTP successfully
- [ ] Profile auto-created after phone verification
- [ ] Can complete all 5 onboarding steps
- [ ] All data stored in single row (no duplicates)
- [ ] Can view data in dashboard

---

## 🎯 Expected User Flow

```
1. User visits /auth
   ↓
2. Enters phone number → Sends OTP
   ↓
3. Enters OTP → Verifies
   ↓
4. Database trigger creates profile row
   - Sets: id, phone, phone_verified=true
   ↓
5. Redirects to /onboarding
   ↓
6. Step 0: Name, Email, Password
   - Updates: full_name, email
   ↓
7. Step 1: Farming Experience
   - Updates: bio, experience_years
   ↓
8. Step 2: Farm Details
   - Updates: farm_name, farm_size, primary_crops
   ↓
9. Step 3: Location
   - Updates: city, district, state, pincode
   ↓
10. Step 4: Complete
    - Sets: onboarding_complete=true, onboarding_step=5
   ↓
11. Redirects to /dashboard
   ↓
12. Shows complete profile with all data ✅
```

**Result:** Single row in `profiles` table with all user data. No duplicates!

---

## 📞 Support

If you encounter issues:

1. Check Supabase Logs: **Logs** → **Auth Logs** and **Database Logs**
2. Run verification queries above
3. Check browser console for errors (F12)
4. Verify phone provider configuration

---

## ✨ You're All Set!

Database is now clean and ready to use. Start testing the complete flow!

🎉 Happy farming! 🌾
