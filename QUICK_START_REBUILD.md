# 🚀 BetterCV Rebuild - Quick Start Guide

## ⚡ Fast Track: Start Building in 10 Minutes

### Prerequisites Check
```bash
# Check Node.js version (need 20+)
node -v  # Should be v20.x.x or higher

# Check npm
npm -v

# Check git
git --version
```

---

## 🎯 Option 1: Full Monorepo Setup (Recommended)

### Step 1: Initialize New Project
```bash
# Create new directory
cd ~/Desktop
npx create-turbo@latest bettercv-v2

# Choose:
# - Package manager: npm
# - TypeScript: Yes
```

### Step 2: Add Backend (NestJS)
```bash
cd bettercv-v2/apps

# Create NestJS app
npx @nestjs/cli new api
# Choose: npm

cd api

# Install dependencies
npm install --save \
  @nestjs/config \
  @nestjs/passport \
  @nestjs/jwt \
  @prisma/client \
  @trpc/server \
  zod \
  bcryptjs \
  class-validator \
  class-transformer

npm install --save-dev \
  @types/bcryptjs \
  @types/passport-jwt \
  prisma
```

### Step 3: Add Database (Prisma)
```bash
cd ../../  # Back to root
mkdir packages/database
cd packages/database

# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env
```

### Step 4: Setup Frontend (Next.js)
```bash
cd ../apps

# Create Next.js app
npx create-next-app@latest web
# Choose:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - App Router: Yes
# - Import alias: Yes (@/*)

cd web

# Install dependencies
npm install --save \
  @trpc/client \
  @trpc/server \
  @trpc/react-query \
  @tanstack/react-query \
  zod \
  zustand \
  react-hook-form \
  @hookform/resolvers
```

---

## 🎯 Option 2: Minimal Setup (Faster Start)

### Step 1: Start with NestJS Only
```bash
cd ~/Desktop
npx @nestjs/cli new bettercv-v2-api

cd bettercv-v2-api

# Install core dependencies
npm install --save \
  @nestjs/config \
  @prisma/client \
  zod \
  bcryptjs

npm install --save-dev \
  @types/bcryptjs \
  prisma

# Initialize Prisma
npx prisma init
```

### Step 2: Create Basic Structure
```bash
# Generate modules
nest g module auth
nest g module users
nest g module cv
nest g module builder
nest g module websites

# Generate services
nest g service auth
nest g service users
nest g service cv
nest g service builder
nest g service websites
```

---

## 📋 Database Schema (Copy This)

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum Role {
  USER
  ADMIN
}

enum SubscriptionPlan {
  FREE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
}

enum ParseStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

// Models
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String?
  role          Role     @default(USER)
  emailVerified Boolean  @default(false) @map("email_verified")
  twoFAEnabled  Boolean  @default(false) @map("two_fa_enabled")
  twoFASecret   String?  @map("two_fa_secret")

  subscription  Subscription?
  cvs           CV[]
  projects      Project[]
  websites      Website[]
  sessions      Session[]

  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshToken String   @unique @map("refresh_token")
  expiresAt    DateTime @map("expires_at")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")

  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@map("sessions")
}

model Subscription {
  id                String             @id @default(cuid())
  userId            String             @unique @map("user_id")
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan              SubscriptionPlan   @default(FREE)
  status            SubscriptionStatus @default(ACTIVE)
  stripeCustomerId  String?            @unique @map("stripe_customer_id")
  stripeSubscriptionId String?         @unique @map("stripe_subscription_id")
  currentPeriodEnd  DateTime?          @map("current_period_end")

  // Usage limits
  websitesUsed      Int                @default(0) @map("websites_used")
  projectsUsed      Int                @default(0) @map("projects_used")
  aiCreditsUsed     Int                @default(0) @map("ai_credits_used")
  storageUsed       BigInt             @default(0) @map("storage_used") // bytes

  createdAt         DateTime           @default(now()) @map("created_at")
  updatedAt         DateTime           @updatedAt @map("updated_at")

  @@map("subscriptions")
}

model CV {
  id           String      @id @default(cuid())
  userId       String      @map("user_id")
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  filename     String
  originalName String      @map("original_name")
  fileUrl      String      @map("file_url")
  fileSize     BigInt      @map("file_size") // bytes
  mimeType     String      @map("mime_type")

  // Parsed data (JSON)
  parsedData   Json?       @map("parsed_data")
  status       ParseStatus @default(PENDING)
  errorMessage String?     @map("error_message")

  websites     Website[]

  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  @@index([userId])
  @@index([status])
  @@map("cvs")
}

model Project {
  id          String    @id @default(cuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String
  description String?

  versions    Version[]

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([userId])
  @@map("projects")
}

model Version {
  id          String   @id @default(cuid())
  projectId   String   @map("project_id")
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  version     Int
  content     Json     // GrapesJS or builder state
  screenshot  String?
  message     String?  // Commit message
  isCurrent   Boolean  @default(false) @map("is_current")

  websites    Website[]

  createdAt   DateTime @default(now()) @map("created_at")

  @@unique([projectId, version])
  @@index([projectId])
  @@index([isCurrent])
  @@map("versions")
}

model Website {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  cvId          String?  @map("cv_id")
  cv            CV?      @relation(fields: [cvId], references: [id], onDelete: SetNull)

  versionId     String?  @map("version_id")
  version       Version? @relation(fields: [versionId], references: [id], onDelete: SetNull)

  title         String
  subdomain     String   @unique
  customDomain  String?  @unique @map("custom_domain")

  html          String   @db.Text
  metadata      Json?    // SEO, social meta tags

  published     Boolean  @default(false)
  publishedAt   DateTime? @map("published_at")

  // Analytics
  viewCount     Int      @default(0) @map("view_count")

  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([published])
  @@map("websites")
}

model Template {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String
  thumbnail   String?

  content     Json     // GrapesJS or builder state
  html        String   @db.Text

  isPremium   Boolean  @default(false) @map("is_premium")
  isFeatured  Boolean  @default(false) @map("is_featured")

  usageCount  Int      @default(0) @map("usage_count")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@index([isPremium])
  @@index([isFeatured])
  @@map("templates")
}
```

---

## 🔧 Environment Setup

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/bettercv_v2"

# Or use Neon (recommended)
DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-this"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-api01-xxx"

# AWS S3 (or compatible)
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="bettercv-files"

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"

# Email (Resend)
RESEND_API_KEY="re_xxx"

# App
NODE_ENV="development"
PORT="4000"
FRONTEND_URL="http://localhost:3000"
```

---

## 🏃 Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Open Prisma Studio (GUI for database)
npx prisma studio
```

---

## 🚀 Start Development

```bash
# Backend
npm run start:dev

# Frontend (in another terminal)
cd ../web
npm run dev
```

---

## 📁 Recommended Folder Structure

```
bettercv-v2/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   │   └── register.dto.ts
│   │   │   │   │   ├── guards/
│   │   │   │   │   │   └── jwt.guard.ts
│   │   │   │   │   └── strategies/
│   │   │   │   │       └── jwt.strategy.ts
│   │   │   │   ├── users/
│   │   │   │   ├── cv/
│   │   │   │   ├── builder/
│   │   │   │   └── websites/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   └── pipes/
│   │   │   ├── config/
│   │   │   │   └── configuration.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   └── package.json
│   │
│   └── web/                   # Next.js frontend
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── (dashboard)/
│       │   │   ├── projects/
│       │   │   ├── websites/
│       │   │   └── settings/
│       │   ├── builder/
│       │   │   └── [id]/
│       │   ├── api/
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/            # shadcn components
│       │   ├── auth/
│       │   ├── builder/
│       │   └── layouts/
│       ├── lib/
│       │   ├── trpc.ts
│       │   └── utils.ts
│       └── package.json
│
├── packages/
│   ├── database/              # Prisma schema
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── package.json
│   │
│   ├── validation/            # Shared Zod schemas
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── cv.ts
│   │   │   └── builder.ts
│   │   └── package.json
│   │
│   └── types/                 # Shared TypeScript types
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── turbo.json
├── package.json
└── README.md
```

---

## ✅ First Tasks Checklist

### Day 1: Setup
- [ ] Initialize project structure
- [ ] Setup Prisma with database
- [ ] Create initial schema
- [ ] Run first migration
- [ ] Setup NestJS app
- [ ] Configure environment variables

### Day 2: Auth Module
- [ ] User registration
- [ ] Email/password login
- [ ] JWT implementation
- [ ] Refresh tokens
- [ ] Email verification
- [ ] Password reset

### Day 3: User Module
- [ ] Get user profile
- [ ] Update user profile
- [ ] Delete account
- [ ] User settings
- [ ] Activity logs

### Day 4-5: CV Module
- [ ] File upload (S3)
- [ ] CV parsing with Claude
- [ ] Store parsed data
- [ ] List user CVs
- [ ] Delete CV

### Day 6-7: Builder Module
- [ ] Create project
- [ ] Save design version
- [ ] Load design
- [ ] Version history
- [ ] Restore version

### Week 2: Website Module
- [ ] Generate HTML from design
- [ ] Create website
- [ ] Subdomain management
- [ ] Publish/unpublish
- [ ] Analytics basics

### Week 3: Premium Features
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Usage tracking
- [ ] Template library
- [ ] Advanced analytics

### Week 4: Polish & Deploy
- [ ] Testing (90%+ coverage)
- [ ] Documentation
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deploy to production

---

## 🎯 Quick Wins (Do These First)

1. **Get Auth Working** (Critical Path)
   - Users can register
   - Users can login
   - JWT protection works

2. **Basic CV Upload**
   - File upload to S3
   - Store in database
   - List user's CVs

3. **Simple Builder**
   - Save design as JSON
   - Load design
   - Export HTML

4. **Deploy Preview**
   - One website per user
   - Subdomain works
   - Can view published site

Once these 4 work, you have an MVP!

---

## 💡 Pro Tips

### Use Code Generators
```bash
# NestJS
nest g resource users
nest g service email
nest g guard roles

# Prisma
npx prisma migrate dev --name add_new_field
```

### Test as You Go
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Keep Dependencies Updated
```bash
npm outdated
npm update
```

### Use Prisma Studio
```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

---

## 🚨 Common Issues

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Port Already in Use
```bash
lsof -ti:4000 | xargs kill -9
```

### Database Connection Failed
Check your DATABASE_URL in .env

### TypeScript Errors
```bash
npm run build
# Fix all type errors
```

---

## 📚 Learning Resources

### NestJS
- Docs: https://docs.nestjs.com
- Course: https://www.udemy.com/course/nestjs-zero-to-hero/

### Prisma
- Docs: https://www.prisma.io/docs
- Examples: https://github.com/prisma/prisma-examples

### Next.js
- Docs: https://nextjs.org/docs
- Examples: https://github.com/vercel/next.js/tree/canary/examples

### tRPC
- Docs: https://trpc.io/docs
- Example: https://github.com/trpc/examples-next-prisma-starter

---

Ready to start? Pick an option and let's build! 🚀
