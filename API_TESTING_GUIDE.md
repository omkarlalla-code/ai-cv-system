# BetterCV API Testing Guide

Complete guide for testing the BetterCV API. Perfect for Claude Code beta testing sessions.

## Prerequisites

1. **Start the Backend Server**
   ```bash
   cd /Users/nitinlalla/Desktop/bettercv-system/backend
   npm install
   npm run dev
   ```
   Server should be running on `http://localhost:3000`

2. **Database Setup**
   Ensure PostgreSQL is running with the schema loaded:
   ```bash
   psql -U your_user -d bettercv -f database/schema.sql
   psql -U your_user -d bettercv -f database/builder-schema.sql
   ```

3. **Environment Variables**
   Check `backend/.env` has:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   PORT=3000
   DATABASE_URL=postgresql://...
   JWT_SECRET=your_secret_key
   ```

4. **Testing Tools**
   Use any of:
   - cURL (command line)
   - Thunder Client (VS Code extension)
   - Postman
   - HTTPie
   - JavaScript fetch/axios

---

## Testing Workflow

### Step 1: Health Check

Verify server is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-09T...",
  "uptime": 123,
  "environment": "development"
}
```

---

### Step 2: User Registration

Create a test user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Expected response:
```json
{
  "success": true,
  "userId": "uuid-here",
  "token": "jwt-token-here",
  "message": "User registered successfully"
}
```

**Save the token!** You'll need it for authenticated requests.

---

### Step 3: Login

Test login with existing user:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

### Step 4: Get User Profile

Test authenticated endpoint:

```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 5: Create a Project

Create a new builder project:

```bash
curl -X POST http://localhost:3000/api/builder-v2/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Portfolio",
    "description": "Testing the builder API"
  }'
```

**Save the project ID** for next steps.

---

### Step 6: Save a Design Version

This requires multipart form data. Using cURL:

```bash
# First, create a test screenshot (you can use any PNG image)
# For testing, we'll skip the screenshot and test other endpoints first

curl -X POST http://localhost:3000/api/builder-v2/save-version \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "projectId=YOUR_PROJECT_ID" \
  -F "polotnoState={\"pages\":[],\"version\":\"1.0\"}" \
  -F "commitMessage=Initial commit" \
  -F "screenshot=@/path/to/test-image.png"
```

---

### Step 7: Get Version History

```bash
curl http://localhost:3000/api/builder-v2/versions/YOUR_PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 8: Generate Website

This is the AI-powered endpoint that converts a design to HTML:

```bash
curl -X POST http://localhost:3000/api/builder-v2/generate-website \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "screenshot=@/path/to/design-screenshot.png" \
  -F "versionId=YOUR_VERSION_ID"
```

**Note:** This requires a valid Anthropic API key in .env

Expected response (takes 2-5 seconds):
```json
{
  "success": true,
  "websiteId": "uuid",
  "html": "<!DOCTYPE html>...",
  "generationTime": 3500,
  "message": "Website generated successfully"
}
```

---

### Step 9: Iterate on Website

Refine the generated website with feedback:

```bash
curl -X POST http://localhost:3000/api/builder-v2/iterate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "websiteId": "YOUR_WEBSITE_ID",
    "feedback": "Make the header text larger and change background to dark blue"
  }'
```

---

### Step 10: Get All Projects

```bash
curl http://localhost:3000/api/builder-v2/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing CV Upload (If Implemented)

### Upload a CV File

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "cv=@/path/to/resume.pdf"
```

### Get Parsed CV Data

```bash
curl http://localhost:3000/api/upload/cv/YOUR_CV_DATA_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing Templates

### Get All Templates

```bash
curl http://localhost:3000/api/templates
```

### Get Specific Template

```bash
curl http://localhost:3000/api/templates/TEMPLATE_ID
```

### Create Custom Template

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Template",
    "description": "Custom design",
    "htmlContent": "<!DOCTYPE html><html>...</html>",
    "cssContent": "body { margin: 0; }",
    "category": "creative"
  }'
```

---

## Testing Websites

### Create Website

```bash
curl -X POST http://localhost:3000/api/website \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "siteTitle": "Test Portfolio",
    "subdomain": "testuser123",
    "templateId": "TEMPLATE_ID",
    "cvDataId": "CV_DATA_ID",
    "themeColors": {
      "primary": "#3b82f6",
      "secondary": "#8b5cf6"
    }
  }'
```

### Get User Websites

```bash
curl http://localhost:3000/api/website/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Publish Website

```bash
curl -X POST http://localhost:3000/api/website/WEBSITE_ID/publish \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Error Testing

### Test Invalid Token

```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer invalid_token"
```

Expected: `401 Unauthorized`

### Test Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test"
  }'
```

Expected: `400 Bad Request` with validation errors

### Test Rate Limiting

Make 6+ requests rapidly to an auth endpoint:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}';
done
```

Expected: `429 Too Many Requests` after 5 attempts

---

## JavaScript Testing Examples

### Using Fetch API

```javascript
// Register user
const registerUser = async () => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!'
    })
  });

  const data = await response.json();
  console.log('Token:', data.token);
  return data.token;
};

// Create project
const createProject = async (token) => {
  const response = await fetch('http://localhost:3000/api/builder-v2/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'My Portfolio',
      description: 'Test project'
    })
  });

  return await response.json();
};

// Generate website
const generateWebsite = async (token, screenshot) => {
  const formData = new FormData();
  formData.append('screenshot', screenshot);

  const response = await fetch('http://localhost:3000/api/builder-v2/generate-website', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

---

## Node.js Testing Script

Create `test-api.js`:

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let authToken = '';

async function testAPI() {
  try {
    // 1. Health check
    console.log('1. Testing health check...');
    const health = await axios.get('http://localhost:3000/health');
    console.log('✓ Health check passed:', health.data.status);

    // 2. Register user
    console.log('\n2. Testing user registration...');
    const registerData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPass123!'
    };

    const registerRes = await axios.post(`${API_BASE}/auth/register`, registerData);
    authToken = registerRes.data.token;
    console.log('✓ User registered successfully');

    // 3. Get profile
    console.log('\n3. Testing get profile...');
    const profileRes = await axios.get(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Profile retrieved:', profileRes.data.user.username);

    // 4. Create project
    console.log('\n4. Testing create project...');
    const projectRes = await axios.post(
      `${API_BASE}/builder-v2/projects`,
      {
        name: 'Test Portfolio',
        description: 'Automated test project'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✓ Project created:', projectRes.data.project.id);

    // 5. Get projects
    console.log('\n5. Testing get projects...');
    const projectsRes = await axios.get(`${API_BASE}/builder-v2/projects`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✓ Projects retrieved:', projectsRes.data.projects.length);

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
```

Run with:
```bash
node test-api.js
```

---

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:**
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Run schema files

### Issue: "ANTHROPIC_API_KEY not found"
**Solution:**
1. Add key to backend/.env
2. Restart server

### Issue: "Token expired"
**Solution:**
1. Login again to get new token
2. Tokens expire after set time (check JWT_EXPIRES_IN)

### Issue: "CORS error"
**Solution:**
1. Check CORS configuration in server.js
2. Ensure frontend URL is whitelisted

### Issue: "File upload fails"
**Solution:**
1. Check file size (<10MB)
2. Verify multer configuration
3. Check uploads directory exists

---

## Test Data

### Sample Puck State (polotnoState)

```json
{
  "pages": [
    {
      "id": "page1",
      "width": 1440,
      "height": 900,
      "children": [
        {
          "type": "Section",
          "props": {
            "backgroundColor": "#ffffff",
            "padding": "40px"
          }
        }
      ]
    }
  ],
  "version": "1.0"
}
```

### Sample Theme Colors

```json
{
  "primary": "#3b82f6",
  "secondary": "#8b5cf6",
  "background": "#ffffff",
  "text": "#1f2937",
  "accent": "#10b981"
}
```

---

## Performance Testing

### Test Response Times

```bash
# Use httpie with timing
http --print=hbHB http://localhost:3000/api/builder-v2/projects \
  "Authorization:Bearer YOUR_TOKEN"
```

### Load Testing with Apache Bench

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/user/profile
```

---

## Next Steps for Testing

1. **Automated Tests**: Write Jest/Mocha tests
2. **Integration Tests**: Test full workflows
3. **Load Tests**: Test under heavy traffic
4. **Security Tests**: Test auth vulnerabilities
5. **API Monitoring**: Set up logging/monitoring

---

## Resources

- [Full API Documentation](./API_DOCUMENTATION.md)
- [Thunder Client Collection](./thunder-collection.json)
- [Backend Code](./backend/)

---

**Happy Testing!**
