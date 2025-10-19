# BetterCV API Documentation

Complete REST API documentation for the BetterCV system - a CV-to-portfolio website builder.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.bettercv.com/api
```

## Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Users](#user-endpoints)
3. [CV Upload & Parsing](#cv-upload--parsing)
4. [Builder V2 (Puck Builder)](#builder-v2-endpoints)
5. [Templates](#template-endpoints)
6. [Websites](#website-endpoints)
7. [Health Check](#health-check)

---

## Authentication Endpoints

### Register New User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "uuid",
  "token": "jwt_token",
  "message": "User registered successfully"
}
```

---

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

### Verify Email

```http
POST /api/auth/verify-email
```

**Request Body:**
```json
{
  "userId": "uuid",
  "verificationCode": "123456"
}
```

---

### Request Password Reset

```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

---

### Reset Password

```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "resetToken": "token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

---

### Enable 2FA

```http
POST /api/auth/enable-2fa
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "secret": "2FA_SECRET",
  "qrCode": "data:image/png;base64,..."
}
```

---

### Verify 2FA

```http
POST /api/auth/verify-2fa
```

**Request Body:**
```json
{
  "token": "123456"
}
```

---

## User Endpoints

### Get Current User Profile

```http
GET /api/user/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePictureUrl": "https://...",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Profile

```http
PUT /api/user/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "johndoe_new",
  "profilePictureUrl": "https://..."
}
```

---

### Get User Statistics

```http
GET /api/user/stats
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalProjects": 5,
    "totalWebsites": 3,
    "totalViews": 1250,
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

---

## CV Upload & Parsing

### Upload CV File

```http
POST /api/upload
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `cv`: File (PDF, DOCX, or TXT)

**Response:**
```json
{
  "success": true,
  "fileId": "uuid",
  "cvDataId": "uuid",
  "message": "CV uploaded and parsing initiated"
}
```

---

### Get CV Data

```http
GET /api/upload/cv/:cvDataId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "cvData": {
    "id": "uuid",
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "location": "San Francisco, CA",
      "summary": "Experienced software engineer..."
    },
    "education": [
      {
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "school": "University of Example",
        "year": "2020",
        "gpa": "3.8"
      }
    ],
    "experience": [
      {
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "startDate": "2020-06",
        "endDate": "2023-05",
        "description": "Developed web applications..."
      }
    ],
    "skills": ["JavaScript", "Python", "React", "Node.js"],
    "projects": [
      {
        "name": "Project Name",
        "description": "Built a web app...",
        "technologies": ["React", "Node.js"],
        "url": "https://github.com/..."
      }
    ],
    "parsingStatus": "completed"
  }
}
```

---

### Get All User CVs

```http
GET /api/upload/cvs
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "cvs": [
    {
      "id": "uuid",
      "originalFilename": "resume.pdf",
      "parsingStatus": "completed",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Builder V2 Endpoints

The Builder V2 API powers the Puck-based visual website builder with version control.

### Create New Project

```http
POST /api/builder-v2/projects
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Portfolio",
  "description": "Personal portfolio website"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "My Portfolio",
    "description": "Personal portfolio website",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get All Projects

```http
GET /api/builder-v2/projects
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "uuid",
      "name": "My Portfolio",
      "description": "Personal portfolio website",
      "currentScreenshot": "https://...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  ]
}
```

---

### Save Design Version

```http
POST /api/builder-v2/save-version
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `projectId`: UUID
- `polotnoState`: JSON string (Puck editor state)
- `screenshot`: PNG file
- `commitMessage`: String (optional)

**Response:**
```json
{
  "success": true,
  "versionId": "uuid",
  "message": "Version saved successfully"
}
```

---

### Get Version History

```http
GET /api/builder-v2/versions/:projectId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "versions": [
    {
      "id": "uuid",
      "versionNumber": 3,
      "screenshotUrl": "https://...",
      "commitMessage": "Updated hero section",
      "isCurrent": true,
      "createdAt": "2024-01-02T00:00:00Z",
      "createdBy": "uuid"
    },
    {
      "id": "uuid",
      "versionNumber": 2,
      "screenshotUrl": "https://...",
      "commitMessage": "Added contact form",
      "isCurrent": false,
      "createdAt": "2024-01-01T12:00:00Z",
      "createdBy": "uuid"
    }
  ]
}
```

---

### Get Specific Version

```http
GET /api/builder-v2/version/:versionId
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "version": {
    "id": "uuid",
    "projectId": "uuid",
    "versionNumber": 3,
    "polotnoState": { },
    "screenshotUrl": "https://...",
    "commitMessage": "Updated hero section",
    "createdAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### Restore Previous Version

```http
POST /api/builder-v2/restore-version
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "versionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Version restored successfully",
  "polotnoState": { }
}
```

---

### Generate Website from Design

```http
POST /api/builder-v2/generate-website
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `screenshot`: PNG file (screenshot of the design)
- `versionId`: UUID (optional)
- `polotnoState`: JSON string (optional)

**Response:**
```json
{
  "success": true,
  "websiteId": "uuid",
  "html": "<!DOCTYPE html>...",
  "generationTime": 3500,
  "message": "Website generated successfully"
}
```

**Notes:**
- Uses Claude 3.5 Sonnet to convert design to responsive HTML/CSS
- Typical generation time: 2-5 seconds
- Returns complete, production-ready HTML

---

### Iterate on Generated Website

```http
POST /api/builder-v2/iterate
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "websiteId": "uuid",
  "feedback": "Make the hero section background darker and increase font size"
}
```

**Response:**
```json
{
  "success": true,
  "iterationNumber": 2,
  "html": "<!DOCTYPE html>...",
  "message": "Website refined successfully"
}
```

**Notes:**
- Uses Claude to refine the HTML based on user feedback
- Preserves responsive design and structure
- Returns updated HTML

---

## Template Endpoints

### Get All Templates

```http
GET /api/templates
```

**Query Parameters:**
- `category`: String (optional) - Filter by category
- `featured`: Boolean (optional) - Show only featured
- `public`: Boolean (optional) - Show only public templates

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "uuid",
      "name": "Developer Portfolio",
      "description": "Modern portfolio for developers",
      "previewImageUrl": "https://...",
      "category": "tech",
      "isFeatured": true,
      "usageCount": 150,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Template by ID

```http
GET /api/templates/:id
```

**Response:**
```json
{
  "success": true,
  "template": {
    "id": "uuid",
    "name": "Developer Portfolio",
    "description": "Modern portfolio for developers",
    "htmlContent": "<html>...",
    "cssContent": "body { ... }",
    "previewImageUrl": "https://...",
    "category": "tech"
  }
}
```

---

### Create Custom Template

```http
POST /api/templates
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Custom Template",
  "description": "A unique design",
  "htmlContent": "<html>...",
  "cssContent": "body { ... }",
  "category": "creative",
  "isPublic": false
}
```

---

## Website Endpoints

### Create New Website

```http
POST /api/website
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "siteTitle": "John Doe Portfolio",
  "subdomain": "johndoe",
  "templateId": "uuid",
  "cvDataId": "uuid",
  "themeColors": {
    "primary": "#3b82f6",
    "secondary": "#8b5cf6",
    "background": "#ffffff",
    "text": "#1f2937"
  }
}
```

**Response:**
```json
{
  "success": true,
  "website": {
    "id": "uuid",
    "siteTitle": "John Doe Portfolio",
    "subdomain": "johndoe",
    "url": "https://johndoe.bettercv.com",
    "isPublished": false
  }
}
```

---

### Get User Websites

```http
GET /api/website/user
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "websites": [
    {
      "id": "uuid",
      "siteTitle": "John Doe Portfolio",
      "subdomain": "johndoe",
      "url": "https://johndoe.bettercv.com",
      "isPublished": true,
      "viewCount": 1250,
      "lastDeployedAt": "2024-01-10T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Website by ID

```http
GET /api/website/:id
```

**Response:**
```json
{
  "success": true,
  "website": {
    "id": "uuid",
    "siteTitle": "John Doe Portfolio",
    "subdomain": "johndoe",
    "templateId": "uuid",
    "cvDataId": "uuid",
    "customHtml": "<html>...",
    "customCss": "body { ... }",
    "themeColors": { },
    "isPublished": true,
    "viewCount": 1250
  }
}
```

---

### Update Website

```http
PUT /api/website/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "siteTitle": "Updated Title",
  "customCss": "body { background: #000; }",
  "themeColors": { }
}
```

---

### Publish Website

```http
POST /api/website/:id/publish
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Website published successfully",
  "url": "https://johndoe.bettercv.com",
  "deploymentId": "uuid"
}
```

---

### Unpublish Website

```http
POST /api/website/:id/unpublish
```

**Headers:**
```
Authorization: Bearer <token>
```

---

### Delete Website

```http
DELETE /api/website/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

---

### Preview Website

```http
GET /api/website/:id/preview
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
Returns rendered HTML preview

---

## Health Check

### Server Health

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "environment": "development"
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid auth token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **AI generation**: Limited by Anthropic API quotas

---

## Webhooks (Coming Soon)

Future support for:
- Website published events
- CV parsing completed
- Generation completed

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All IDs are UUIDs
- File uploads limited to 10MB
- Image uploads limited to 5MB
- Supported CV formats: PDF, DOCX, TXT
- Supported image formats: PNG, JPG, GIF, WebP

---

## Support

For issues or questions:
- GitHub: https://github.com/[repo]
- Email: support@bettercv.com

---

**Last Updated:** 2024-10-09
**API Version:** 1.0.0
