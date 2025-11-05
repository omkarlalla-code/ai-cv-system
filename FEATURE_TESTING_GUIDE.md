# BetterCV - Complete Feature Testing Guide

This guide shows you how to test every feature of BetterCV, from basic API calls to complex workflows.

---

## 🎯 Table of Contents

1. [Setup](#setup)
2. [Authentication Flow](#authentication-flow)
3. [CV Upload & Parsing](#cv-upload--parsing)
4. [Website Builder](#website-builder)
5. [Template Management](#template-management)
6. [User Profile](#user-profile)
7. [Security Features](#security-features)
8. [Advanced Features](#advanced-features)

---

## Setup

### Prerequisites

1. **Server Running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Get Base URL:**
   ```bash
   export API_URL="http://localhost:3000"
   ```

3. **Install jq (optional, for JSON parsing):**
   ```bash
   brew install jq  # macOS
   # or apt-get install jq  # Linux
   ```

---

## Authentication Flow

### 1. Get CSRF Token

```bash
# Get and save CSRF token
curl -s -c cookies.txt "$API_URL/api/csrf-token" | jq .

# Extract token to variable
export CSRF_TOKEN=$(curl -s "$API_URL/api/csrf-token" | jq -r '.csrfToken')
echo "CSRF Token: $CSRF_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "csrfToken": "a8b5477df8c56e51634df7595b316bb5..."
}
```

### 2. Register a New User

```bash
curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!",
    "name": "Demo User",
    "username": "demouser"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1,
    "username": "demouser",
    "email": "demo@example.com"
  }
}
```

### 3. Login

```bash
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "demouser",
    "email": "demo@example.com"
  }
}
```

**Save the token:**
```bash
export JWT_TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!"
  }' | jq -r '.token')

echo "JWT Token saved: ${JWT_TOKEN:0:50}..."
```

### 4. Verify Email (Check Console Output)

```bash
# Email verification is currently logged to console
# Check your backend terminal for the verification link
```

### 5. Get User Profile

```bash
curl -X GET "$API_URL/api/user/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "demouser",
    "email": "demo@example.com",
    "name": "Demo User",
    "created_at": "2025-11-02T...",
    "is_verified": false
  }
}
```

---

## CV Upload & Parsing

### 1. Create a Sample CV

```bash
cat > sample-cv.txt << 'EOF'
JOHN DOE
Software Engineer

Email: john.doe@example.com
Phone: +1 (555) 123-4567
Location: San Francisco, CA

EXPERIENCE

Senior Software Engineer at Tech Corp
2020 - Present
- Led development of microservices architecture
- Improved system performance by 40%
- Mentored junior developers

Software Engineer at StartupXYZ
2018 - 2020
- Built REST APIs using Node.js
- Implemented CI/CD pipelines
- Worked with React and PostgreSQL

EDUCATION

Bachelor of Science in Computer Science
Stanford University
2014 - 2018

SKILLS

Languages: JavaScript, Python, Java
Frameworks: React, Node.js, Express
Databases: PostgreSQL, MongoDB
Tools: Docker, Kubernetes, Git

PROJECTS

E-commerce Platform
- Built full-stack web application
- Used React, Node.js, and PostgreSQL
- Deployed on AWS

CERTIFICATIONS

AWS Certified Solutions Architect
Google Cloud Professional

LANGUAGES

English (Native)
Spanish (Conversational)

INTERESTS

Open source contribution, Tech blogging, Hiking
EOF
```

### 2. Upload CV for Parsing

```bash
curl -X POST "$API_URL/api/upload-cv" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -F "cv=@sample-cv.txt" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "CV uploaded successfully and is being processed",
  "data": {
    "cvDataId": 1,
    "filename": "sample-cv.txt",
    "status": "processing"
  }
}
```

**Save the CV ID:**
```bash
export CV_ID=$(curl -s -X POST "$API_URL/api/upload-cv" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -F "cv=@sample-cv.txt" | jq -r '.data.cvDataId')

echo "CV ID: $CV_ID"
```

### 3. Check CV Parsing Status

```bash
# Wait a few seconds for AI processing
sleep 5

curl -X GET "$API_URL/api/cv-status/$CV_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "hasPersonalInfo": true,
    "createdAt": "2025-11-02T...",
    "updatedAt": "2025-11-02T..."
  }
}
```

### 4. Get Upload History

```bash
curl -X GET "$API_URL/api/upload-history?limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

---

## Website Builder

### 1. Create a New Project

```bash
curl -X POST "$API_URL/api/builder-v2/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "My Portfolio Website",
    "description": "Personal portfolio showcasing my projects"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "name": "My Portfolio Website",
    "description": "Personal portfolio showcasing my projects",
    "created_at": "2025-11-02T..."
  }
}
```

**Save Project ID:**
```bash
export PROJECT_ID=$(curl -s -X POST "$API_URL/api/builder-v2/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "My Portfolio Website",
    "description": "Personal portfolio"
  }' | jq -r '.project.id')

echo "Project ID: $PROJECT_ID"
```

### 2. List All Projects

```bash
curl -X GET "$API_URL/api/builder-v2/projects" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

### 3. Save a Design Version

First, create a simple design screenshot:
```bash
# Create a test image
convert -size 800x600 xc:white -pointsize 40 \
  -draw "text 200,300 'My Portfolio'" \
  test-screenshot.png

# Or just create a dummy file
echo "dummy screenshot data" > test-screenshot.png
```

Save the version:
```bash
curl -X POST "$API_URL/api/builder-v2/save-version" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -F "projectId=$PROJECT_ID" \
  -F "builderState={\"html\":\"<h1>Hello World</h1>\",\"css\":\"h1{color:blue}\"}" \
  -F "commitMessage=Initial design" \
  -F "screenshot=@test-screenshot.png" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "versionId": 1,
  "message": "Version saved successfully"
}
```

### 4. Get Version History

```bash
curl -X GET "$API_URL/api/builder-v2/versions/$PROJECT_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

### 5. Generate Website with AI

**Note:** Requires `ANTHROPIC_API_KEY` in `.env`

```bash
curl -X POST "$API_URL/api/builder-v2/generate-website" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -F "versionId=1" \
  -F "builderState={\"html\":\"<h1>Portfolio</h1>\",\"css\":\"\"}" \
  -F "screenshot=@test-screenshot.png" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "websiteId": 1,
  "html": "<!DOCTYPE html><html>...",
  "generationTime": 2543,
  "message": "Website generated successfully"
}
```

### 6. Iterate on Generated Website

```bash
curl -X POST "$API_URL/api/builder-v2/iterate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "websiteId": 1,
    "feedback": "Make the header larger and change the color to purple"
  }' | jq .
```

---

## Template Management

### 1. List Available Templates

```bash
curl -X GET "$API_URL/api/templates" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

### 2. Get Specific Template

```bash
curl -X GET "$API_URL/api/templates/1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

---

## User Profile

### 1. Update Profile

```bash
curl -X PUT "$API_URL/api/user/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "name": "John Doe Updated",
    "bio": "Full-stack developer passionate about web technologies"
  }' | jq .
```

### 2. Get User Statistics

```bash
curl -X GET "$API_URL/api/user/stats" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalCVs": 3,
    "totalWebsites": 2,
    "totalProjects": 5,
    "accountAge": "30 days"
  }
}
```

### 3. Get Activity Logs

```bash
curl -X GET "$API_URL/api/user/activity?limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

---

## Security Features

### 1. Test Rate Limiting

```bash
# Make 6 rapid requests (limit is 5)
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: $CSRF_TOKEN" \
    -b cookies.txt \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

**Expected:** 6th request should return 429 (Too Many Requests)

### 2. Test Invalid File Upload

```bash
# Create a fake PDF
echo "This is not a real PDF" > fake.pdf

curl -X POST "$API_URL/api/upload-cv" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -F "cv=@fake.pdf" | jq .
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid file",
  "details": "File type mismatch..."
}
```

### 3. Test Expired Token

```bash
# Use an expired or invalid token
curl -X GET "$API_URL/api/user/profile" \
  -H "Authorization: Bearer invalid_token_xyz" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## Advanced Features

### 1. Password Reset Flow

#### Request Reset
```bash
curl -X POST "$API_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "email": "demo@example.com"
  }' | jq .
```

**Check console for reset link**

#### Reset Password
```bash
curl -X POST "$API_URL/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "NewSecurePass123!"
  }' | jq .
```

### 2. Two-Factor Authentication

#### Setup 2FA
```bash
curl -X POST "$API_URL/api/auth/2fa/setup" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

#### Verify 2FA
```bash
curl -X POST "$API_URL/api/auth/2fa/verify" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -d '{
    "token": "123456"
  }' | jq .
```

---

## Complete Testing Script

Save this as `test-all-features.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "🧪 Testing All BetterCV Features"
echo "================================="

# 1. Get CSRF Token
echo -e "\n1️⃣ Getting CSRF Token..."
CSRF_TOKEN=$(curl -s "$API_URL/api/csrf-token" | jq -r '.csrfToken')
echo "✅ Token: ${CSRF_TOKEN:0:20}..."

# 2. Register User
echo -e "\n2️⃣ Registering User..."
REGISTER=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{
    "email": "test'$RANDOM'@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "username": "testuser'$RANDOM'"
  }')
echo "$REGISTER" | jq .

# 3. Login
echo -e "\n3️⃣ Logging In..."
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{
    "email": "'$(echo $REGISTER | jq -r '.data.email')'",
    "password": "SecurePass123!"
  }')
JWT_TOKEN=$(echo "$LOGIN" | jq -r '.token')
echo "✅ JWT: ${JWT_TOKEN:0:30}..."

# 4. Get Profile
echo -e "\n4️⃣ Getting Profile..."
curl -s "$API_URL/api/user/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" | jq .

# 5. Create Project
echo -e "\n5️⃣ Creating Project..."
PROJECT=$(curl -s -X POST "$API_URL/api/builder-v2/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{
    "name": "Test Portfolio",
    "description": "Testing BetterCV"
  }')
echo "$PROJECT" | jq .

# 6. List Projects
echo -e "\n6️⃣ Listing Projects..."
curl -s "$API_URL/api/builder-v2/projects" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" | jq .

echo -e "\n✅ All Features Tested!"
```

Make it executable:
```bash
chmod +x test-all-features.sh
./test-all-features.sh
```

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Get CSRF Token
curl -s http://localhost:3000/api/csrf-token | jq -r '.csrfToken'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"email":"user@example.com","password":"pass"}'

# Access Protected Route
curl http://localhost:3000/api/builder-v2/projects \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: 403 CSRF Error
**Solution:** Make sure to include both cookie and X-CSRF-Token header

### Issue: 401 Unauthorized
**Solution:** Check JWT token is valid and included in Authorization header

### Issue: File Upload Fails
**Solution:** Ensure file is valid PDF/DOC/DOCX/TXT and under 10MB

### Issue: AI Generation Fails
**Solution:** Check ANTHROPIC_API_KEY is set in backend/.env

---

**Happy Testing! 🎉**
