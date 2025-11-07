# BetterCV - AI-Powered CV to Website Generator

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=flat)
![Claude AI](https://img.shields.io/badge/Claude%20AI-Powered-orange)

**Transform CVs into beautiful portfolio websites using AI**

Upload your CV → AI parses it → Drag & drop builder → Professional website

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API](#api)

</div>

---

## 🎯 What is BetterCV?

BetterCV is a comprehensive platform that allows students and professionals to:
1. **Upload** their CV in any format (PDF, Word, Text)
2. **Extract** data automatically using Claude AI
3. **Build** custom portfolio websites with a drag-and-drop editor
4. **Deploy** to custom subdomains (username.better

cv.com)
5. **Manage** multiple versions and templates

Perfect for schools, universities, and organizations wanting to create standardized portfolio websites for their students.

## ✨ Features

### 🤖 AI-Powered CV Parsing
- Multi-format support (PDF, DOCX, TXT)
- Intelligent data extraction with Claude 3.5 Sonnet
- Automatic section detection (education, experience, skills, projects)
- Contact information extraction

### 🎨 Visual Website Builder (GrapesJS)
- **Drag-and-drop** interface - No coding required
- **Visual editor** - Edit directly on canvas
- **Real-time preview** - See changes instantly
- **Template system** - Start with pre-built designs
- **Version control** - Save and restore design versions
- **Responsive design** - Mobile-friendly by default

### ⚡ AI HTML Generation
- Convert designs to production-ready HTML/CSS
- 2-5 second generation time
- Clean, semantic code
- Fully responsive output
- Natural language iteration ("make it more colorful", "add animations")

### 🔐 Complete Authentication
- JWT-based authentication
- Email verification
- Two-factor authentication (2FA) with QR codes
- Password reset flow
- Activity logging
- Rate limiting

### 🌐 Hosting & Deployment
- Custom subdomain system (username.bettercv.com)
- GitLab integration for version control
- One-click publishing
- SSL certificates
- Custom domain support (planned)

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer
- **AI**: Anthropic Claude 3.5 Sonnet API

### Frontend
- **Builder**: React + GrapesJS (drag-and-drop visual editor)
- **Build Tool**: Vite
- **Styling**: CSS3, Flexbox, Grid
- **UI**: Vanilla JS (dashboard), React (builder)

### Infrastructure
- **Version Control**: Git + GitLab
- **Deployment**: Docker (planned)
- **Hosting**: Subdomain routing with nginx
- **Email**: SMTP (configurable)

## 📦 Project Structure

```
bettercv-system/
├── backend/                    # Express API server
│   ├── config/                # Database & environment config
│   ├── middleware/            # Auth, logging, error handling
│   ├── routes/                # API endpoints
│   │   ├── auth.js           # Authentication
│   │   ├── user.js           # User management
│   │   ├── builder-v2.js     # Puck builder + AI generation
│   │   ├── upload.js         # CV upload & parsing
│   │   ├── template.js       # Template management
│   │   └── website.js        # Website deployment
│   ├── services/             # Business logic
│   │   └── cvParser.js       # AI CV parsing
│   ├── server.js             # Main server file
│   └── package.json
│
├── frontend/                  # Client applications
│   ├── builder/              # React builder app (GrapesJS)
│   │   ├── src/
│   │   │   ├── components/   # Builder components
│   │   │   ├── App.jsx       # Main builder app
│   │   │   ├── GrapesJSEditor.jsx  # GrapesJS editor
│   │   │   └── App.css
│   │   └── package.json
│   ├── index.html            # Landing page
│   ├── dashboard.html        # User dashboard
│   ├── scripts/              # Client-side JS
│   └── styles/               # CSS files
│
├── database/                  # Database schemas
│   ├── schema.sql            # Main schema (users, CVs, websites)
│   └── builder-schema.sql    # Builder schema (projects, versions)
│
├── templates/                 # Website templates
│   └── template1.html
│
├── docs/                      # Documentation
│   ├── API_DOCUMENTATION.md   # Complete REST API reference
│   ├── API_TESTING_GUIDE.md   # Testing workflows
│   ├── BUILDER_GUIDE.md       # Builder tutorial
│   ├── BUILDER_SUMMARY.md     # Technical overview
│   ├── DEPLOYMENT_GUIDE.md    # Production deployment
│   ├── DEVELOPMENT.md         # Development guide
│   ├── QUICK_START.md         # Quick start guide
│   └── ... (more docs)
│
├── scripts/                   # Utility scripts
│   ├── setup-database.sh      # Database setup
│   ├── setup-neon-db.sh       # Neon DB setup
│   ├── setup-test-db.sh       # Test DB setup
│   ├── test-fixes.sh          # Run tests
│   └── deploy.sh              # Deployment script
│
├── .env.example              # Environment variables template
├── .gitignore
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** and npm
- **PostgreSQL 13+**
- **Anthropic API key** (optional for testing - [Get one here](https://console.anthropic.com/))
  - ✅ App works in **demo mode** without API key
  - ⚡ Add API key for real AI parsing

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/omkarlalla-code/ai-cv-system.git
   cd ai-cv-system

   # Install backend dependencies
   cd backend && npm install

   # Install frontend builder dependencies
   cd ../frontend/builder && npm install
   cd ../..
   ```

2. **Set up database** (choose one method)

   **Option A: Quick Setup Script**
   ```bash
   chmod +x scripts/setup-database.sh
   ./scripts/setup-database.sh
   ```

   **Option B: Manual Setup**
   ```bash
   createdb bettercv
   psql -U your_user -d bettercv -f database/schema.sql
   psql -U your_user -d bettercv -f database/migrations/001_create_notifications.sql
   psql -U your_user -d bettercv -f database/migrations/002_create_email_logs.sql
   ```

3. **Configure environment**
   ```bash
   # Copy example env file
   cp .env.example backend/.env

   # Edit backend/.env - Minimal required config:
   # DATABASE_URL=postgresql://user:password@localhost:5432/bettercv
   # JWT_SECRET=your-secret-key-here
   # PORT=3000

   # Optional (adds real AI parsing):
   # ANTHROPIC_API_KEY=sk-ant-api01-xxxxx
   ```

4. **Start the application**

   ```bash
   # Terminal 1: Backend API (http://localhost:3000)
   cd backend
   npm run dev

   # Terminal 2: Builder App (http://localhost:3001)
   cd frontend/builder
   npm run dev
   ```

5. **Access the application**
   - **Landing Page**: Open `frontend/index.html` in browser
   - **Dashboard**: `frontend/dashboard/index.html`
   - **Builder**: http://localhost:3001
   - **API**: http://localhost:3000

### First Steps

1. **Register** a new account from the landing page
2. **Log in** to access your dashboard
3. **Upload your CV** (PDF, DOCX, or TXT)
   - 🎭 Without API key: Gets realistic demo data
   - ⚡ With API key: AI extracts your real data
4. **Select a template** from 6 professional designs
5. **Generate website** with one click
6. **Customize** in the GrapesJS builder
7. **Save and publish** your portfolio!

### Demo Mode (No API Key Required)

The application automatically runs in **demo mode** when no `ANTHROPIC_API_KEY` is configured:

- ✅ Upload and parse CVs (extracts name, email, phone)
- ✅ Uses realistic mock data for testing
- ✅ Complete user flow works end-to-end
- ✅ Perfect for development and testing

Add your Anthropic API key later to enable real AI parsing.

## 📚 Documentation

### For Users
- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running in 3 steps
- **[Builder Guide](docs/BUILDER_GUIDE.md)** - Complete builder tutorial
- **[View Application Guide](docs/VIEW_APPLICATION.md)** - How to access and use the app

### For Developers
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete REST API reference
- **[API Testing Guide](docs/API_TESTING_GUIDE.md)** - Testing workflow and examples
- **[Development Guide](docs/DEVELOPMENT.md)** - Development setup and workflow
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Builder Summary](docs/BUILDER_SUMMARY.md)** - Technical overview

### Additional Resources
- **[Security Fixes](docs/SECURITY_FIXES.md)** - Security implementations
- **[Feature Testing Guide](docs/FEATURE_TESTING_GUIDE.md)** - Testing features
- **[Week by Week Roadmap](docs/WEEK_BY_WEEK_ROADMAP.md)** - Development roadmap

### API Collection
- **[Thunder Client Collection](thunder-collection.json)** - Import into VS Code/Postman

## 🎨 Builder Features

### GrapesJS Visual Editor
- **Component Library** - Drag and drop HTML elements
- **Style Manager** - Visual CSS editor
- **Layer Manager** - Organize page structure
- **Block Manager** - Pre-built components
- **Device Manager** - Preview different screen sizes
- **Asset Manager** - Image and file uploads
- **Code Editor** - Direct HTML/CSS editing
- **Undo/Redo** - Full history management

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Login
POST   /api/auth/verify-email      - Email verification
POST   /api/auth/forgot-password   - Password reset request
POST   /api/auth/2fa/setup         - Setup 2FA
POST   /api/auth/2fa/verify        - Verify 2FA
```

### User Management
```
GET    /api/user/profile           - Get profile
PUT    /api/user/profile           - Update profile
GET    /api/user/stats             - Get statistics
GET    /api/user/activity          - Activity logs
```

### Builder V2
```
POST   /api/builder-v2/projects                - Create project
GET    /api/builder-v2/projects                - List projects
GET    /api/builder-v2/projects/:id            - Get project
PUT    /api/builder-v2/projects/:id            - Update project
DELETE /api/builder-v2/projects/:id            - Delete project
POST   /api/builder-v2/save-version            - Save design version
GET    /api/builder-v2/versions/:projectId     - Get version history
POST   /api/builder-v2/restore-version         - Restore version
POST   /api/builder-v2/generate-website        - AI HTML generation
POST   /api/builder-v2/iterate                 - Refine with AI
POST   /api/builder-v2/export                  - Export HTML
```

### Templates
```
GET    /api/templates              - List templates
GET    /api/templates/:id          - Get template
POST   /api/templates              - Create template
```

### Websites
```
GET    /api/websites               - List websites
POST   /api/website                - Create/deploy website
GET    /api/website/:subdomain     - Get website
PUT    /api/website/:subdomain     - Update website
DELETE /api/website/:subdomain     - Delete website
```

### CV Upload
```
POST   /api/upload/cv              - Upload and parse CV
GET    /api/upload/status/:id      - Check parsing status
```

## ⚙️ Environment Variables

Create `backend/.env` with:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-api01-xxxxx
DATABASE_URL=postgresql://user:password@localhost:5432/bettercv
JWT_SECRET=your-secret-key-here

# Optional
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=7d

# Email (optional for testing)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# GitLab (for deployment)
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your-gitlab-token

# Domain configuration
BASE_DOMAIN=bettercv.com
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","name":"Test User"}'
```

### With Thunder Client
1. Install Thunder Client in VS Code
2. Import `thunder-collection.json`
3. Set environment variable `authToken`
4. Start testing endpoints!

## 🎯 Use Cases

### For Schools & Universities
- Create standardized portfolio sites for all students
- Showcase student work to recruiters
- Simple CV submission process
- Professional online presence

### For Individual Users
- Convert CV to portfolio website in minutes
- No coding knowledge required
- Multiple design templates
- Easy updates and maintenance

### For Organizations
- Employee directory with portfolios
- Team member showcase
- Recruitment tool
- Professional branding

## 🔒 Security Features

- JWT authentication with token refresh
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints
- CSRF protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure file upload validation

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ CV upload and AI parsing
- ✅ Visual drag-and-drop builder with GrapesJS
- ✅ AI HTML generation with Claude 3.5 Sonnet
- ✅ Authentication system (JWT, 2FA)
- ✅ Version control for designs
- ✅ Template system

### Planned Features
- [ ] Real-time collaboration
- [ ] Custom domain support
- [ ] Analytics dashboard
- [ ] SEO optimization tools
- [ ] Social media integration
- [ ] PDF export
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic Claude API** - AI-powered CV parsing and HTML generation
- **GrapesJS** - Open-source visual page builder
- **Express.js** - Backend framework
- **PostgreSQL** - Database
- **React** - Frontend library
- **Vite** - Build tool

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/omkarlalla-code/ai-cv-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/omkarlalla-code/ai-cv-system/discussions)
- **Email**: lallanitin66@gmail.com

---

<div align="center">

**Built with ❤️ to make professional portfolios accessible to everyone**

[⭐ Star this repo](https://github.com/omkarlalla-code/ai-cv-system) if you find it useful!

</div>
