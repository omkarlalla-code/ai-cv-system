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

### 🎨 Visual Website Builder (Puck)
- **Drag-and-drop** interface - No coding required
- **25+ Components** - Headers, cards, grids, timelines, testimonials
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
- **Builder**: React + Puck (drag-and-drop)
- **Styling**: CSS3, Flexbox, Grid
- **UI**: Vanilla JS (dashboard), React (builder)
- **Image Handling**: Sharp

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
│   ├── builder/              # React builder app (Puck)
│   │   ├── src/
│   │   │   ├── components/   # Puck components
│   │   │   ├── App.jsx       # Main builder app
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
├── docs/                      # Additional documentation
│   ├── API_DOCUMENTATION.md
│   ├── API_TESTING_GUIDE.md
│   ├── BUILDER_GUIDE.md
│   ├── BUILDER_SUMMARY.md
│   └── QUICK_START.md
│
├── .env.example              # Environment variables template
├── .gitignore
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL 13+
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omkarlalla-code/ai-cv-system.git
   cd ai-cv-system
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend builder
   cd ../frontend/builder
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create database
   createdb bettercv

   # Run migrations
   psql -U your_user -d bettercv -f database/schema.sql
   psql -U your_user -d bettercv -f database/builder-schema.sql
   ```

4. **Configure environment**
   ```bash
   # Copy example env file
   cp .env.example backend/.env

   # Edit backend/.env and add:
   # - ANTHROPIC_API_KEY (required)
   # - DATABASE_URL
   # - JWT_SECRET
   # - Other configuration
   ```

5. **Start the servers**

   ```bash
   # Terminal 1: Backend (http://localhost:3000)
   cd backend
   npm run dev

   # Terminal 2: Builder (http://localhost:3001)
   cd frontend/builder
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:8080 (or open `frontend/index.html`)
   - Builder: http://localhost:3001
   - API: http://localhost:3000

### First Steps

1. Register a new account at `/index.html`
2. Log in to access the dashboard
3. Upload a CV or start with the builder
4. Choose a template or start from scratch
5. Drag components, customize, and generate!

## 📚 Documentation

### For Users
- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 3 steps
- **[Builder Guide](BUILDER_GUIDE.md)** - Complete builder tutorial
- **[PowerPoint Features](POWERPOINT_FEATURES.md)** - PowerPoint-like functionality

### For Developers
- **[API Documentation](API_DOCUMENTATION.md)** - Complete REST API reference
- **[API Testing Guide](API_TESTING_GUIDE.md)** - Testing workflow and examples
- **[Builder Summary](BUILDER_SUMMARY.md)** - Technical overview

### API Collection
- **[Thunder Client Collection](thunder-collection.json)** - Import into VS Code/Postman

## 🎨 Builder Components

### Layout Components (8)
- `Section` - Page sections with customizable backgrounds
- `Grid` - Responsive grid layouts
- `FlexContainer` - Flexible container with alignment
- `TwoColumn` - Two-column layout
- `Card` - Content cards with shadows/borders
- `HeroSection` - Large header sections
- `Navbar` - Navigation bars
- `Footer` - Page footers

### CV Components (6)
- `EducationCard` - Education entries
- `ExperienceCard` - Work experience
- `ProjectCard` - Project showcases
- `SkillBadge` - Individual skills
- `SkillsGrid` - Skill collections
- `ContactInfo` - Contact details

### Portfolio Components (4)
- `Timeline` - Timeline visualizations
- `Testimonial` - Testimonial cards
- `StatsSection` - Statistics display
- `CTASection` - Call-to-action sections

### Basic Components (7)
- `Heading` - H1-H6 headings
- `Paragraph` - Text blocks
- `Button` - Interactive buttons
- `Image` - Image display
- `Box` - Generic container
- `Spacer` - Vertical spacing
- `Divider` - Horizontal lines

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
- ✅ Drag-and-drop builder with Puck
- ✅ AI HTML generation
- ✅ Authentication system
- ✅ Version control
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
- **Puck** - Drag-and-drop builder framework
- **Express.js** - Backend framework
- **PostgreSQL** - Database
- **React** - Frontend library

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/omkarlalla-code/ai-cv-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/omkarlalla-code/ai-cv-system/discussions)
- **Email**: lallanitin66@gmail.com

---

<div align="center">

**Built with ❤️ to make professional portfolios accessible to everyone**

[⭐ Star this repo](https://github.com/omkarlalla-code/ai-cv-system) if you find it useful!

</div>
