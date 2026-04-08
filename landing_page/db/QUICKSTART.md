# 🚀 Quick Start - Database Reset

## 3-Step Reset Process

### 1️⃣ Cleanup (Delete Everything)
```bash
# Open: db/000_cleanup.sql
# Copy → Paste in Supabase SQL Editor → RUN
```

### 2️⃣ Create Schema
```bash
# Open: db/001_profiles_schema.sql
# Copy → Paste in Supabase SQL Editor → RUN
```

### 3️⃣ Enable Phone Auth
- Supabase → Authentication → Providers → Phone → Enable
- Add Twilio credentials
- Save

## ✅ Done! Test at: http://localhost:3000/auth

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `000_cleanup.sql` | Deletes all database objects |
| `001_profiles_schema.sql` | Creates fresh database schema |
| `SETUP_GUIDE.md` | Complete step-by-step instructions |
| `README.md` | Original documentation |

---

## 🧪 Quick Test

After setup, run in Supabase SQL Editor:

```sql
-- Verify table exists
SELECT COUNT(*) FROM profiles;

-- Should return 0 (empty table)
```

Then test signup flow:
1. Go to `/auth`
2. Signup with phone
3. Complete onboarding
4. Check dashboard

---

## 🐛 Quick Fixes

**OTP not sending?**
→ Enable Phone provider in Supabase Auth settings

**Profile not created?**
→ Check if trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Duplicate profiles?**
→ Run cleanup query from SETUP_GUIDE.md

---

Full docs: See `SETUP_GUIDE.md`
