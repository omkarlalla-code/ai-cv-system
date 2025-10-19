# BetterCV API - Ready for Testing

The BetterCV API is now fully documented and ready for beta testing by another Claude Code session!

## What's Included

### 1. Complete API Documentation
- **File**: `API_DOCUMENTATION.md`
- Comprehensive REST API documentation
- All endpoints with request/response examples
- Authentication, error handling, rate limits

### 2. Testing Guide
- **File**: `API_TESTING_GUIDE.md`
- Step-by-step testing workflow
- cURL examples for all endpoints
- JavaScript/Node.js testing scripts
- Common issues and solutions

### 3. Thunder Client Collection
- **File**: `thunder-collection.json`
- Import into Thunder Client (VS Code) or Postman
- Pre-configured requests for all endpoints
- Environment variables for easy testing

## Quick Start for Testing

### 1. Start the Backend

```bash
cd /Users/nitinlalla/Desktop/bettercv-system/backend
npm install
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Verify Server is Running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123,
  "environment": "development"
}
```

### 3. Start Testing

Choose your method:

**Option A: Use Thunder Client**
1. Install Thunder Client in VS Code
2. Import `thunder-collection.json`
3. Start testing with one click!

**Option B: Use cURL**
Follow the examples in `API_TESTING_GUIDE.md`

**Option C: Use the Node.js Script**
See the test script in `API_TESTING_GUIDE.md`

## API Features

### Core Functionality
- ✅ **Authentication**: Register, login, 2FA, email verification
- ✅ **User Management**: Profile, stats, activity logs
- ✅ **Builder V2**: Project management, version control
- ✅ **AI Generation**: Convert designs to responsive HTML/CSS
- ✅ **Templates**: Browse and create custom templates
- ✅ **Websites**: Create, publish, manage portfolio sites
- ✅ **CV Upload**: Parse and extract CV data (partial)

### Key Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| Health | `GET /health` | Server health check |
| Auth | `POST /api/auth/register` | Create new user |
| Auth | `POST /api/auth/login` | User login |
| User | `GET /api/user/profile` | Get user profile |
| Builder | `POST /api/builder-v2/projects` | Create project |
| Builder | `POST /api/builder-v2/save-version` | Save design version |
| Builder | `POST /api/builder-v2/generate-website` | AI HTML generation |
| Builder | `POST /api/builder-v2/iterate` | AI refinement |
| Templates | `GET /api/templates` | List templates |
| Website | `POST /api/website` | Create website |

## Testing Workflow

1. **Health Check** → Verify server is running
2. **Register** → Create test user account
3. **Login** → Get auth token
4. **Create Project** → Start new builder project
5. **Save Version** → Save design with screenshot
6. **Generate Website** → Use AI to convert to HTML
7. **Iterate** → Refine with AI feedback
8. **Create Website** → Deploy portfolio site

## Environment Setup

Required environment variables in `backend/.env`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
JWT_SECRET=your_secret_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bettercv

# Optional
NODE_ENV=development
JWT_EXPIRES_IN=7d
```

## Database Setup

The API requires PostgreSQL with these schemas:

```bash
# Main schema (users, CVs, websites)
psql -U your_user -d bettercv -f database/schema.sql

# Builder schema (projects, versions)
psql -U your_user -d bettercv -f database/builder-schema.sql
```

## API Architecture

```
BetterCV Backend
├── server.js                    # Main Express server
├── routes/
│   ├── auth.js                 # Authentication endpoints
│   ├── user.js                 # User management endpoints
│   ├── builder-v2.js           # Puck builder + AI generation
│   ├── upload.js               # CV file upload & parsing
│   ├── template.js             # Template management
│   └── website.js              # Website deployment
├── middleware/
│   ├── auth.js                 # JWT authentication
│   ├── errorHandler.js         # Error handling
│   └── logger.js               # Request logging
├── config/
│   └── database.js             # PostgreSQL connection
└── services/
    └── ...                     # Business logic
```

## Key Features for Testing

### 1. Version Control System
Git-like version control for designs:
- Save versions with commit messages
- View version history
- Restore previous versions
- Track changes over time

### 2. AI-Powered Generation
Claude 3.5 Sonnet integration:
- Convert design screenshots to HTML/CSS
- Generate responsive, production-ready code
- Iterate with natural language feedback
- 2-5 second generation time

### 3. Authentication & Security
- JWT token-based auth
- 2FA support with QR codes
- Email verification
- Password reset flow
- Rate limiting
- Activity logging

### 4. Builder V2 (Puck)
Visual website builder:
- Drag-and-drop components
- Real-time preview
- Template system
- Save/load projects
- Export to HTML

## Testing Priorities

### High Priority
1. ✅ Health check
2. ✅ User registration/login
3. ✅ Create project
4. ✅ AI website generation
5. ✅ Version control

### Medium Priority
6. Template management
7. Website publishing
8. User profile updates
9. 2FA setup
10. Activity logs

### Lower Priority
11. CV upload/parsing
12. Email verification
13. Password reset
14. Website analytics

## Known Limitations

1. **CV Parsing**: Partially implemented, AI parsing needs work
2. **Email Service**: Console logging only, not sending real emails
3. **File Storage**: Using memory storage, not cloud (S3/CloudFlare)
4. **Deployment**: GitLab integration not implemented
5. **Subdomain Setup**: DNS management not implemented

## Testing Tips

1. **Save your tokens**: Auth tokens are needed for most endpoints
2. **Use environment variables**: Set `{{authToken}}` in Thunder Client
3. **Check console logs**: Backend logs useful debug info
4. **Test error cases**: Try invalid inputs, missing auth, etc.
5. **Monitor performance**: AI generation takes 2-5 seconds

## Support Files

- `API_DOCUMENTATION.md` - Complete API reference
- `API_TESTING_GUIDE.md` - Testing workflow and examples
- `thunder-collection.json` - Thunder Client/Postman collection
- `QUICK_START.md` - Builder quick start guide
- `BUILDER_GUIDE.md` - Comprehensive builder documentation

## Next Steps

After basic testing works:
1. **Add missing endpoints**: CV parsing, deployment, etc.
2. **Implement email service**: Real email verification
3. **Add file storage**: S3 or CloudFlare R2
4. **GitLab integration**: Automated deployment
5. **Frontend testing**: Test with actual UI
6. **Load testing**: Performance under load
7. **Security audit**: Check for vulnerabilities

## For the Testing Session

**Goal**: Verify all documented endpoints work correctly

**Testing Checklist**:
- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] User can register
- [ ] User can login and receive token
- [ ] Authenticated requests work with token
- [ ] Can create a project
- [ ] Can save a version
- [ ] AI generation works (requires API key)
- [ ] Can iterate on generated HTML
- [ ] Error handling works properly
- [ ] Rate limiting triggers correctly

**Tools Available**:
- cURL examples in testing guide
- Thunder Client collection
- Node.js test script template
- Complete documentation

## Contact & Issues

For issues or questions during testing:
- Check `API_TESTING_GUIDE.md` for troubleshooting
- Review console logs in backend
- Verify environment variables are set
- Ensure PostgreSQL is running

---

**API Version**: 1.0.0
**Last Updated**: 2024-10-09
**Status**: Ready for Beta Testing ✅
