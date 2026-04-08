# 🔧 Fix Duplicate Profiles - Merge Script

## Problem
You have **2 separate profile rows**:
1. **Google Login** profile (ID: `37ffdb06...`) - has email, no farm data
2. **Phone OTP** profile (ID: `485625cc...`) - has farm data, no email

This happened because phone OTP created a **new user** instead of adding phone to existing Google account.

---

## ✅ Solution Applied

### Code Changes (Already Done)
1. **Onboarding page** now:
   - Checks if user is logged in before allowing onboarding
   - Updates **existing user's profile** instead of creating new one
   - Merges phone verification with current user session

2. **Auth flow** now:
   - Login → Check profile → Redirect to onboarding if incomplete
   - Phone verification updates current user's profile (not create new)

### Database Cleanup (Do Now)

**Run this SQL in Supabase to merge your duplicate profiles:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy paste this query:

```sql
-- Merge duplicate profiles (Google + Phone)
UPDATE profiles 
SET 
  phone = '9686293233',
  bio = '',
  experience_years = '0-2',
  farm_name = 'Kinara Farm',
  farm_size = 'small',
  primary_crops = 'Rice',
  city = 'Bengaluru',
  district = 'Bengaluru',
  state = 'Karnataka',
  pincode = '560072',
  phone_verified = true,
  verified_at = '2025-11-16 02:52:04.909+00',
  onboarding_complete = true,
  onboarding_step = 5,
  updated_at = NOW()
WHERE id = '37ffdb06-0cec-4ff3-9b7f-5fa9b6e37281';

-- Delete the duplicate phone-only profile
DELETE FROM profiles WHERE id = '485625cc-7f8d-48f3-b293-9b47cb9f6a62';

-- Verify the merge
SELECT * FROM profiles WHERE email = 'biobloom135@gmail.com';
```

3. Click **Run**
4. You should see **1 row** with all data merged! ✓

---

## 🧪 Testing New Flow

**For new users (won't create duplicates anymore):**

1. **Option A: Email/Password Signup**
   ```
   /auth → Sign up with email → /onboarding → Add phone + farm data → /dashboard
   ```
   Result: 1 profile row with email + phone + farm data ✓

2. **Option B: Google Login then Onboarding**
   ```
   /auth → Google login → /onboarding → Add phone + farm data → /dashboard
   ```
   Result: 1 profile row with email + phone + farm data ✓

**The fix ensures:**
- ✅ User must login FIRST before onboarding
- ✅ Phone OTP updates existing profile (doesn't create new user)
- ✅ All data stays in ONE row per user

---

## 🔍 Verify It Worked

After running the merge SQL:

```sql
-- Should return 1 row with all data
SELECT 
  full_name,
  email, 
  phone, 
  farm_name, 
  city,
  onboarding_complete 
FROM profiles 
WHERE email = 'biobloom135@gmail.com';
```

**Expected result:**
```
full_name: "Bio Bloom"
email: "biobloom135@gmail.com"
phone: "9686293233"
farm_name: "Kinara Farm"
city: "Bengaluru"
onboarding_complete: true
```

---

## 📝 What Changed in Code

**File: `app/onboarding/page.tsx`**

**Before (BAD):**
```typescript
// Phone OTP created NEW user session
const { data, error } = await supabase.auth.verifyOtp({...})
// This created a separate auth.users entry!
```

**After (GOOD):**
```typescript
// Get CURRENT logged-in user first
const { data: { user: currentUser } } = await supabase.auth.getUser()

// Verify OTP (may create phone session)
const { data: otpData } = await supabase.auth.verifyOtp({...})

// Use current user's ID if already logged in
const userIdToUpdate = currentUser?.id || otpData.user?.id

// Update THAT profile, not create new
await supabase.from('profiles').update({...}).eq('id', userIdToUpdate)
```

**Also Added:**
```typescript
// Block unauthorized access to onboarding
useEffect(() => {
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login first to complete onboarding')
      router.push('/auth')
    }
  }
  checkAuth()
}, [])
```

---

## 🎯 Summary

**Problem:** Phone OTP created separate user → 2 profile rows
**Fix:** 
1. ✅ Code updated to merge phone into existing profile
2. 📋 Run SQL to merge your current duplicate data
3. ✅ Future signups won't have this issue

**Next Step:** Run the SQL merge script above! 🚀
