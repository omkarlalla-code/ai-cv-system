# 📦 Migration Strategy: Old System → New System

## 🎯 Goal: Zero-Downtime Migration

Migrate users and data from current system to new commercial-grade platform without service interruption.

---

## 🗺️ Migration Phases

### Phase 1: Parallel Development (Weeks 1-4)
**What:** Build new system while old system runs

```
Old System (Running)  ────────────────────→  Keep running
                                              │
New System            ──Build──→ Test ──→ Deploy to staging
```

**Actions:**
- Build new system in separate directory/repo
- Use different database (don't touch old DB yet)
- Test thoroughly with dummy data
- Get to feature parity

**Risk:** Low (systems are independent)

---

### Phase 2: Soft Launch (Week 5)
**What:** New users → new system, old users → old system

```
New Signups ──→ New System
                    │
Old Users  ──→ Old System (read-only mode)
```

**Actions:**
1. Deploy new system to production (different domain: v2.bettercv.com)
2. Add banner to old system: "New version available!"
3. New signups go to new system only
4. Old users can opt-in to migrate

**Migration Flow for Opt-In Users:**
```javascript
// Migration endpoint in new system
POST /api/migrate
Body: {
  oldSystemEmail: "user@example.com",
  oldSystemPassword: "password"
}

Process:
1. Verify credentials against old system API
2. Create user in new system
3. Migrate data (CVs, projects, websites)
4. Send confirmation email
5. Disable account in old system
```

**Risk:** Low (users choose when to migrate)

---

### Phase 3: Data Migration (Week 6)
**What:** Move all remaining users automatically

```
                    ┌─ New System (Primary)
                    │
Old System ─migrate─┤
                    │
                    └─ Old System (Archived, read-only)
```

**Steps:**

1. **Export Old Database**
```sql
-- Export users
COPY users TO '/tmp/users.csv' DELIMITER ',' CSV HEADER;

-- Export CVs
COPY cv_data TO '/tmp/cvs.csv' DELIMITER ',' CSV HEADER;

-- Export websites
COPY user_sites TO '/tmp/websites.csv' DELIMITER ',' CSV HEADER;
```

2. **Transform Data**
```typescript
// migration-script.ts
import { PrismaClient } from '@prisma/client';
import csvParser from 'csv-parser';

const oldPrisma = new PrismaClient({
  datasources: { db: { url: OLD_DATABASE_URL } }
});

const newPrisma = new PrismaClient({
  datasources: { db: { url: NEW_DATABASE_URL } }
});

async function migrateUsers() {
  const oldUsers = await oldPrisma.user.findMany();

  for (const oldUser of oldUsers) {
    await newPrisma.user.create({
      data: {
        id: oldUser.id,  // Keep same IDs
        email: oldUser.email,
        passwordHash: oldUser.password_hash,  // Hash is compatible
        name: oldUser.username,
        emailVerified: oldUser.is_verified,
        twoFAEnabled: !!oldUser.two_fa_secret,
        twoFASecret: oldUser.two_fa_secret,
        createdAt: oldUser.created_at,
        subscription: {
          create: {
            plan: 'FREE',  // All users start on free plan
            status: 'ACTIVE',
          }
        }
      }
    });
  }
}

async function migrateCVs() {
  const oldCVs = await oldPrisma.cv_data.findMany();

  for (const oldCV of oldCVs) {
    // Upload file to S3 first
    const fileUrl = await uploadToS3(oldCV.file_path);

    await newPrisma.cV.create({
      data: {
        userId: oldCV.user_id,
        filename: oldCV.original_filename,
        originalName: oldCV.original_filename,
        fileUrl: fileUrl,
        fileSize: oldCV.file_size || 0,
        mimeType: oldCV.file_type || 'application/pdf',
        parsedData: oldCV.personal_info,  // JSON data compatible
        status: oldCV.parsing_status === 'completed' ? 'COMPLETED' : 'FAILED',
        createdAt: oldCV.created_at,
      }
    });
  }
}

async function migrateWebsites() {
  // Similar pattern
}
```

3. **Validate Migration**
```typescript
async function validateMigration() {
  const oldUserCount = await oldPrisma.user.count();
  const newUserCount = await newPrisma.user.count();

  console.log(`Old users: ${oldUserCount}`);
  console.log(`New users: ${newUserCount}`);
  console.log(`Match: ${oldUserCount === newUserCount ? '✅' : '❌'}`);

  // Spot check random users
  const sampleUsers = await oldPrisma.user.findMany({ take: 10 });
  for (const user of sampleUsers) {
    const newUser = await newPrisma.user.findUnique({ where: { id: user.id } });
    console.log(`User ${user.email}: ${newUser ? '✅' : '❌'}`);
  }
}
```

4. **Redirect Old Domain**
```nginx
# Old domain (bettercv.com)
server {
  listen 80;
  server_name bettercv.com www.bettercv.com;

  # Redirect to new system
  return 301 https://app.bettercv.com$request_uri;
}
```

**Risk:** Medium (test thoroughly!)

---

### Phase 4: Cleanup (Week 7)
**What:** Decommission old system

```
New System ──→ Primary (100% traffic)
Old System ──→ Archive (read-only backup for 30 days)
```

**Actions:**
1. Set old database to read-only
2. Keep old system running for 30 days (fallback)
3. Monitor for issues
4. After 30 days: shut down old system

---

## 🔄 Rollback Plan

If something goes wrong:

### Week 5-6 (Soft Launch)
```
Issue detected
  ↓
Stop new signups to new system
  ↓
Point all traffic back to old system
  ↓
Fix new system
  ↓
Retry migration
```

**Impact:** New users only (minimal)

### Week 6 (Data Migration)
```
Issue detected
  ↓
Keep new system running
  ↓
Restore old database from backup
  ↓
Point domain back to old system
  ↓
Analyze what went wrong
  ↓
Fix and retry
```

**Impact:** All users see old system again (annoying but safe)

---

## 📊 Data Mapping

### Users
```
Old (users)               New (User)
──────────────────────    ──────────────────────
id                   →    id
username             →    name
email                →    email
password_hash        →    passwordHash
two_fa_secret        →    twoFASecret
is_verified          →    emailVerified
is_active            →    (if false, don't migrate)
created_at           →    createdAt
updated_at           →    updatedAt
```

### CVs
```
Old (cv_data)             New (CV)
──────────────────────    ──────────────────────
id                   →    id
user_id              →    userId
original_filename    →    filename, originalName
file_type            →    mimeType
file_path            →    (upload to S3) → fileUrl
personal_info        →    parsedData (merge all JSON)
education            →    parsedData
experience           →    parsedData
skills               →    parsedData
parsing_status       →    status
created_at           →    createdAt
```

### Websites
```
Old (user_sites)          New (Website)
──────────────────────    ──────────────────────
id                   →    id
user_id              →    userId
cv_data_id           →    cvId
site_title           →    title
subdomain            →    subdomain
custom_html          →    html
is_published         →    published
view_count           →    viewCount
created_at           →    createdAt
```

---

## ⚠️ Edge Cases

### 1. Users with Same Email (shouldn't happen)
```typescript
const existingUser = await newPrisma.user.findUnique({
  where: { email: oldUser.email }
});

if (existingUser) {
  // Send email to both users
  // Ask which account to keep
  // Manual resolution
  console.error(`Duplicate email: ${oldUser.email}`);
  continue;
}
```

### 2. Missing Files
```typescript
const fileExists = await checkFileExists(oldCV.file_path);

if (!fileExists) {
  // Log missing file
  // Create CV record without file
  // Mark as FAILED status
  console.warn(`Missing file: ${oldCV.file_path}`);
}
```

### 3. Corrupted Data
```typescript
try {
  const parsedData = JSON.parse(oldCV.personal_info);
} catch (error) {
  // Log error
  // Store as null
  // User can re-upload CV
  console.error(`Corrupted data for CV ${oldCV.id}`);
}
```

---

## ✅ Pre-Migration Checklist

### 1 Week Before
- [ ] New system fully tested
- [ ] Load testing passed
- [ ] Security audit complete
- [ ] Backup old database
- [ ] Test migration script on copy of production data
- [ ] Prepare rollback plan
- [ ] Alert users about upcoming migration

### 3 Days Before
- [ ] Final testing on staging
- [ ] Verify all edge cases handled
- [ ] Prepare support documentation
- [ ] Train support team

### 1 Day Before
- [ ] Create final database backup
- [ ] Double-check DNS configuration
- [ ] Verify CDN setup
- [ ] Test rollback procedure

### Migration Day
- [ ] Start during low-traffic hours (2-6 AM)
- [ ] Run migration script
- [ ] Validate data
- [ ] Switch DNS
- [ ] Monitor error rates
- [ ] Check user feedback

### 1 Week After
- [ ] Monitor system health
- [ ] Address user issues
- [ ] Optimize slow queries
- [ ] Collect feedback

### 30 Days After
- [ ] Decommission old system
- [ ] Archive old database
- [ ] Celebrate! 🎉

---

## 📧 User Communication

### 2 Weeks Before
**Email: "Exciting Updates Coming!"**
```
Subject: BetterCV is Getting Better!

Hi [Name],

We're excited to announce that we're launching an improved version
of BetterCV with new features:

✨ Faster website generation
✨ More templates
✨ Better builder
✨ Premium plans

Your account will be automatically migrated on [DATE].
No action needed!

Questions? Reply to this email.

Thanks,
BetterCV Team
```

### 1 Week Before
**Email: "Migration Next Week"**
```
Subject: BetterCV Migration - Next Week

Just a reminder that we're migrating to our new platform
next week on [DATE] at [TIME].

What this means for you:
✅ All your data will be preserved
✅ You'll get new features
✅ Same email/password works

Expected downtime: < 30 minutes

See you on the new platform!
```

### Migration Day
**Email: "We're Live!"**
```
Subject: Welcome to the New BetterCV!

The migration is complete! 🎉

Log in now: https://app.bettercv.com

Your username and password remain the same.

New features:
✨ [Feature 1]
✨ [Feature 2]
✨ [Feature 3]

Having issues? Contact support@bettercv.com

Welcome to BetterCV 2.0!
```

---

## 🎯 Success Metrics

### Technical Success
- ✅ 100% of users migrated
- ✅ 100% of data preserved
- ✅ < 1% error rate during migration
- ✅ < 30 min downtime
- ✅ No data loss

### User Success
- ✅ < 5% support tickets related to migration
- ✅ > 90% user satisfaction
- ✅ < 2% churn due to migration
- ✅ Users adopt new features

---

Ready to migrate when new system is built! 🚀
