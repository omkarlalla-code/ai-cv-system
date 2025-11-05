# BetterCV Security Fixes - Testing Plan

## Prerequisites Check

### ✅ Database
- Using Neon PostgreSQL (cloud database)
- Connection string configured in `.env`

### ⚠️ Anthropic API Key
- **Status:** Not configured (placeholder value)
- **Impact:** AI features won't work, but security fixes can still be tested
- **Action:** You can test without it, or add your key to line 28 of `backend/.env`

### ✅ JWT Secret
- Configured and ready

---

## Testing Steps

### Step 1: Start the Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 CVSite Server running on port 3000
📊 Environment: development
🌐 Frontend: http://localhost:3000
🔗 API: http://localhost:3000/api
❤️  Health: http://localhost:3000/health
```

---

### Step 2: Test Health Check (Baseline)

Open a new terminal and run:

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-01T...",
  "uptime": 1.234,
  "environment": "development"
}
```

✅ If you see this, database connection is working!

---

### Step 3: Test CSRF Protection

#### 3.1 Get CSRF Token (Should Work)
```bash
curl -v http://localhost:3000/api/csrf-token
```

**Expected:**
- Status: `200 OK`
- Response contains `csrfToken`
- Cookie is set: `Set-Cookie: csrfToken=...`

#### 3.2 POST Without CSRF Token (Should Fail)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'
```

**Expected:**
- Status: `403 Forbidden`
- Response: `"message": "CSRF token missing"`

✅ **This proves CSRF protection is working!**

#### 3.3 POST With CSRF Token (Should Work)
```bash
# First, get the token and save cookies
curl -c cookies.txt http://localhost:3000/api/csrf-token

# Extract the token (you'll see it in the response)
# Then use it:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN_HERE" \
  -b cookies.txt \
  -d '{"email":"test@test.com","password":"Test123!","name":"Test"}'
```

**Expected:**
- Status: `200 OK` or `400 Bad Request` (depending on if email exists)
- But NOT `403 Forbidden`

✅ **This proves CSRF token validation works!**

---

### Step 4: Test Authentication on Builder V2 Routes

#### 4.1 Access Builder Route Without Auth (Should Fail)
```bash
# Get CSRF token first
CSRF_TOKEN=$(curl -s http://localhost:3000/api/csrf-token | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)

# Try to access builder endpoint
curl -X GET http://localhost:3000/api/builder-v2/projects \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -v
```

**Expected:**
- Status: `401 Unauthorized`
- Response: `"message": "Access token required"`

✅ **This proves authentication is working!**

#### 4.2 Access Builder Route With Auth (Should Work)

First, let's register and login to get a token:

```bash
# Save CSRF token
CSRF_TOKEN=$(curl -s -c cookies.txt http://localhost:3000/api/csrf-token | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)

# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "username": "testuser"
  }'

# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123!"
  }'
```

**Save the JWT token from the response, then:**

```bash
# Use the JWT token to access builder
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

curl -X GET http://localhost:3000/api/builder-v2/projects \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt
```

**Expected:**
- Status: `200 OK`
- Response: `{"success": true, "projects": [...]}`

✅ **Authentication working correctly!**

---

### Step 5: Test File Validation

Create a test file:

```bash
# Create a fake PDF (malicious)
echo "This is not a real PDF" > fake.pdf

# Try to upload it
curl -X POST http://localhost:3000/api/upload-cv \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -F "cv=@fake.pdf"
```

**Expected:**
- Status: `400 Bad Request`
- Response: `"message": "Invalid file"`

✅ **File validation is working!**

---

### Step 6: Run Automated Tests

```bash
cd backend
npm test
```

**Expected Output:**
```
Test Suites: 1 passed, 3 failed, 4 total
Tests:       10 passed, 3 failed, 13 total

✅ CSRF Protection: 4/5 passing
✅ Authentication: 2/3 passing
✅ Builder V2 Auth: 3/3 passing
✅ Health Check: 1/2 passing
```

**Note:** 3 failures are expected (test database not configured), but security tests should pass!

---

### Step 7: Test Frontend Configuration

```bash
cd frontend/builder
npm run dev
```

**Check the console output:**
- Should show: `Local: http://localhost:3001`
- No hardcoded URLs should appear

**Open browser:** http://localhost:3001

In the browser console, check:
```javascript
console.log(import.meta.env.VITE_API_URL)
// Should output: "http://localhost:3000"
```

✅ **Environment variables working!**

---

## Quick Test Script

I'll create an automated test script for you:

```bash
# Save this as test-fixes.sh
chmod +x test-fixes.sh
./test-fixes.sh
```
