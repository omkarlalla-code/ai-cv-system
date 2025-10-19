# Polotno Visual Builder - Complete Guide

## 🎨 What We Built

A **full Canva-style visual builder** powered by Polotno, with:
- Free-form canvas design (1440px base width)
- Complete version control system (Git-like)
- Claude AI integration for responsive HTML/CSS generation
- Rapid iteration workflow
- Database-backed persistence

---

## ✨ Features

### 1. **Full Canva Experience**
- Drag, resize, rotate any element
- Text, images, shapes, icons
- Layers panel
- Undo/redo
- Real-time preview

### 2. **Version Control (Git-like)**
- Save versions with commit messages
- Visual version history
- Restore previous versions
- Track all changes

### 3. **AI-Powered Export**
- Screenshot → Claude Vision API
- Converts absolute positioning → responsive HTML/CSS
- Mobile-first (320px → 1440px+)
- Semantic HTML5, modern CSS

### 4. **Rapid Iteration**
- Generate website from design
- Provide feedback ("make header blue")
- Claude refines code instantly
- Iterate until perfect

---

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure you have:
- Node.js 16+
- PostgreSQL database
- Anthropic API key
```

### Installation

1. **Database Setup**
```bash
# Run the schema
psql -U bettercv_user -d bettercv_db -f database/builder-schema.sql
```

2. **Environment Variables**
```bash
# Add to backend/.env
ANTHROPIC_API_KEY=your_api_key_here
```

3. **Start Services**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Builder
cd frontend/builder
npm run dev
```

4. **Access Builder**
```
http://localhost:3001
```

---

## 📐 How It Works

### Architecture Flow

```
┌──────────────────────────────────────┐
│  1. Design in Polotno Canvas         │
│     - Add text, images, shapes       │
│     - Position freely anywhere       │
│     - Full styling control           │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  2. Save Version                     │
│     - Polotno state → JSON           │
│     - Screenshot captured            │
│     - Saved to PostgreSQL            │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  3. Generate Website                 │
│     - Screenshot → Claude Vision     │
│     - AI converts to responsive code │
│     - HTML/CSS stored in DB          │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│  4. Iterate & Refine                 │
│     - Preview generated site         │
│     - Provide feedback               │
│     - Claude refines code            │
│     - Repeat until satisfied         │
└──────────────────────────────────────┘
```

---

## 🎯 User Workflow

### Step 1: Create Design
```
1. Open builder (http://localhost:3001)
2. Name your project
3. Add elements from side panel:
   - Text: Click "Text" → drag onto canvas
   - Image: Click "Images" → upload or URL
   - Shapes: Click "Elements" → choose shape
   - Icons: Built-in icon library
4. Position/resize/rotate freely
5. Style using properties panel
```

### Step 2: Save Versions
```
1. Click "💾 Save Version"
2. Auto-generates screenshot
3. Version appears in sidebar
4. Can restore any version later
```

### Step 3: Generate Website
```
1. Click "🚀 Generate Website"
2. Captures full-page screenshot
3. Sends to Claude Vision API
4. Downloads responsive HTML/CSS
5. Stored in database
```

### Step 4: Rapid Iteration (Future)
```
1. Preview generated site
2. Provide feedback: "Make text larger, blue background"
3. Click "Refine"
4. Claude generates updated code
5. Repeat until perfect
```

---

## 🗄️ Database Schema

### Key Tables

**projects**
- User's design projects
- Name, description, timestamps

**design_versions**
- Git-like version control
- Polotno state (JSONB)
- Screenshots
- Version numbers, commit messages
- Parent-child relationships

**generated_websites**
- Claude-generated HTML/CSS
- Links to design version
- Generation metadata

**design_iterations**
- Refinement history
- User feedback → Claude refinements
- Iteration numbers

**saved_components**
- Reusable component library
- Can save sections for reuse

**assets**
- Uploaded images/files
- Metadata storage

---

## 🔌 API Endpoints

### Projects
```javascript
// Create project
POST /api/builder-v2/projects
Body: { name, description }

// Get all projects
GET /api/builder-v2/projects

// Get project versions
GET /api/builder-v2/versions/:projectId
```

### Versions
```javascript
// Save new version
POST /api/builder-v2/save-version
Body: FormData {
  projectId,
  polotnoState: JSON,
  commitMessage,
  screenshot: File
}

// Get specific version
GET /api/builder-v2/version/:versionId

// Restore version
POST /api/builder-v2/restore-version
Body: { versionId }
```

### Generation
```javascript
// Generate website
POST /api/builder-v2/generate-website
Body: FormData {
  versionId,
  polotnoState: JSON,
  screenshot: File
}

// Iterate/refine
POST /api/builder-v2/iterate
Body: {
  websiteId,
  feedback: "Make header blue and text larger"
}
```

---

## 🧠 Claude Prompting Strategy

### Generation Prompt
```
Key instructions to Claude:
1. Convert 1440px absolute design → responsive
2. Mobile-first (320px base)
3. Breakpoints: 768px, 1024px, 1440px+
4. Semantic HTML5
5. CSS Grid/Flexbox (no absolute positioning)
6. CSS custom properties for theming
7. clamp() for fluid typography
8. Accessibility features
```

### Refinement Prompt
```
Provides:
- Current HTML/CSS
- User feedback
- Instructions to modify only what's requested
- Maintain responsive design
```

---

## 📱 Mobile Responsiveness

### How It Works
1. **Design Stage**: Students design at 1440px (desktop)
2. **AI Conversion**: Claude converts to responsive:
   ```css
   /* Mobile-first approach */
   .hero {
     font-size: clamp(24px, 5vw, 48px);
     padding: clamp(20px, 5%, 60px);
   }

   @media (min-width: 768px) {
     /* Tablet adjustments */
   }

   @media (min-width: 1024px) {
     /* Desktop adjustments */
   }
   ```
3. **Output**: Works beautifully on all devices

---

## 🔄 Version Control System

### Git-like Features

**Commits**
- Each save = new version
- Commit messages
- Timestamps
- Author tracking

**History**
- Visual timeline
- Screenshot previews
- One-click restore

**Branching** (Future)
- Create experimental versions
- Merge back to main

---

## ⚙️ Configuration

### Polotno Settings
```javascript
// In PolotnoBuilder.jsx
const store = createStore({
  key: 'YOUR_LICENSE_KEY', // Free for dev
  showCredit: false
});

// Default page size
store.addPage({
  width: 1440,  // Desktop base
  height: 900,  // Auto-expands
  background: 'white'
});
```

### Auto-Save
```javascript
// Debounced auto-save every 2 seconds
store.on('change', handleChange);
// Saves to localStorage (will migrate to DB)
```

---

## 🎨 Customization

### Adding Custom Elements
```javascript
// In Polotno, elements are added via side panel
// Built-in: Text, Images, Shapes, SVG, Upload
// Can extend with custom plugins
```

### Styling
```css
/* PolotnoBuilder.css */
.builder-header {
  background-color: #667eea; /* Your brand color */
}
```

---

## 🚧 Current Limitations

1. **Storage**
   - Screenshots currently base64 in DB
   - Should move to S3/Cloudflare Images

2. **Auth Integration**
   - API routes ready for auth middleware
   - Need to connect to existing auth system

3. **Iteration UI**
   - Backend endpoints ready
   - Frontend UI needs building

4. **Mobile Builder**
   - Currently desktop-only
   - As intended (mobile editing not needed)

---

## 🔮 Future Enhancements

### Week 2
- [ ] S3/Cloudflare image storage
- [ ] Connect to user authentication
- [ ] Component library UI
- [ ] Asset management panel

### Week 3
- [ ] Iteration UI (feedback → refine)
- [ ] Real-time collaboration
- [ ] Template marketplace
- [ ] Export to Figma/Sketch

### Week 4
- [ ] A/B testing variants
- [ ] Analytics integration
- [ ] White-label options
- [ ] Plugin system

---

## 🐛 Troubleshooting

### Builder won't load
```bash
# Check console for errors
# Common issue: React 19 vs Blueprint compatibility
npm install @blueprintjs/core --legacy-peer-deps
```

### Screenshot fails
```bash
# Ensure canvas is rendered
# Check browser console
# Try different export quality
```

### Claude API errors
```bash
# Verify API key in .env
ANTHROPIC_API_KEY=sk-ant-...

# Check quota/limits
# Review prompt length
```

### Database errors
```bash
# Ensure schema is applied
psql -U bettercv_user -d bettercv_db -f database/builder-schema.sql

# Check connection
# Verify user permissions
```

---

## 📊 Performance

### Optimization Tips
1. **Screenshots**: Use lower quality for thumbnails
2. **Polotno State**: Compress JSON before storing
3. **Claude**: Cache common generations
4. **Database**: Index frequently queried fields

### Metrics to Track
- Average generation time
- Storage per project
- API token usage
- User engagement

---

## 🔐 Security

### Best Practices
1. **API Keys**: Never expose in client
2. **File Uploads**: Validate type/size
3. **SQL Injection**: Use parameterized queries (✅ already done)
4. **XSS**: Sanitize generated HTML
5. **Rate Limiting**: Prevent abuse

---

## 📝 Code Structure

```
frontend/builder/
├── src/
│   ├── PolotnoBuilder.jsx     # Main builder component
│   ├── PolotnoBuilder.css     # Builder styling
│   ├── App.jsx                # Entry point
│   └── main.jsx               # React setup
├── package.json
└── vite.config.js

backend/
├── routes/
│   ├── builder.js             # Old Puck-based
│   └── builder-v2.js          # New Polotno-based ✨
└── server.js

database/
├── schema.sql                 # Original schema
└── builder-schema.sql         # Builder v2 schema ✨
```

---

## 🎓 Learning Resources

**Polotno Docs**
- https://polotno.com/docs
- https://community.polotno.com

**Claude Vision API**
- https://docs.anthropic.com/claude/docs/vision

**Database Patterns**
- Version control: https://www.liquibase.com/resources/guides/database-version-control

---

## ✅ What's Done vs What's Next

### ✅ Completed
- [x] Polotno integration
- [x] Full canvas builder UI
- [x] Version control system
- [x] Database schema
- [x] Save/restore versions
- [x] Screenshot export
- [x] Claude generation API
- [x] Iteration/refinement API
- [x] Auto-save functionality
- [x] Version history sidebar

### 🚧 In Progress
- [ ] Connect to auth system
- [ ] Cloud image storage
- [ ] Iteration UI
- [ ] Component library

### 📅 Planned
- [ ] Deployment integration
- [ ] Analytics
- [ ] Collaboration features
- [ ] Template marketplace

---

## 🤝 Contributing

When adding features:
1. Update database schema if needed
2. Add API endpoints in `builder-v2.js`
3. Update frontend component
4. Document in this guide
5. Test responsiveness

---

## 📞 Support

Issues? Check:
1. Browser console
2. Network tab (API calls)
3. Database logs
4. Backend server logs

---

**Built with ❤️ for BetterCV**
*Empowering students to create stunning portfolios without code*
