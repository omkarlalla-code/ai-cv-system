# BetterCV Builder - Quick Start ⚡

## Start in 3 Steps

### 1️⃣ Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: **http://localhost:3000**

### 2️⃣ Start Builder
```bash
cd frontend/builder
npm run dev
```
Builder runs on: **http://localhost:3001**

### 3️⃣ Build Your Portfolio
1. Click **"📋 Templates"** → Choose template
2. **Drag components** from left panel
3. **Edit properties** in right panel
4. Click **"🚀 Generate Website"**
5. **Download** your HTML file

---

## Essential Commands

| Action | Command |
|--------|---------|
| Start builder | `npm run dev` (in `frontend/builder`) |
| Start backend | `npm run dev` (in `backend`) |
| Install deps | `npm install` |
| Build for prod | `npm run build` |

---

## Component Categories

### 📐 Layout (8)
- Section, Grid, FlexContainer, TwoColumn
- Card, HeroSection, Navbar, Footer

### 📄 CV (6)
- EducationCard, ExperienceCard, ProjectCard
- SkillBadge, SkillsGrid, ContactInfo

### 🎨 Portfolio (4)
- Timeline, Testimonial, StatsSection, CTASection

### 🔧 Basic (7)
- Heading, Paragraph, Button, Image
- Box, Spacer, Divider

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Delete component | `Delete` or `Backspace` |
| Duplicate | `Ctrl+D` (planned) |
| Undo | Browser back button |

---

## Templates

### Developer Portfolio
Full-featured portfolio with:
- Navbar with navigation
- Hero section with CTA
- Skills grid
- CTA section
- Footer with socials

### Minimal
Clean design with:
- Hero section
- Grid layout
- Contact info

### Blank
Empty canvas - build from scratch

---

## Common Tasks

### Change Colors
1. Click component
2. Find color field
3. Click color preview
4. Choose from presets or use picker

### Upload Image
1. Click image field
2. Choose **URL** or **Upload** tab
3. Paste URL or select file
4. Press ✓ or upload

### Add Navigation
1. Add **Navbar** component
2. Edit links: `Text|#anchor` format
3. Example: `Home|#home`

### Create Sections
1. Add **Section** component
2. Set section ID (e.g., "about")
3. Add components inside
4. Use navbar links to navigate

---

## Troubleshooting

### "Failed to generate"
✅ Check backend is running
✅ Verify `.env` has `ANTHROPIC_API_KEY`
✅ Restart backend

### Image won't upload
✅ Check file size (<5MB)
✅ Use JPG, PNG, GIF, or WebP
✅ Try URL mode instead

### Component missing
✅ Refresh page
✅ Check if dropped correctly
✅ Clear browser cache

---

## File Locations

```
bettercv-system/
├── backend/                    # Backend API
│   ├── .env                   # Add ANTHROPIC_API_KEY here
│   └── routes/builder-v2.js   # AI generation endpoint
│
├── frontend/builder/          # Builder app
│   ├── src/
│   │   ├── components/
│   │   │   ├── puck-config-complete.jsx  # All components
│   │   │   ├── puck-cv-components.jsx    # CV components
│   │   │   ├── puck-layout-components.jsx # Layout components
│   │   │   ├── ColorPicker.jsx           # Color picker
│   │   │   └── ImageUpload.jsx           # Image upload
│   │   ├── App.jsx            # Main app
│   │   └── App.css            # Styles
│   └── package.json
│
├── BUILDER_GUIDE.md           # Full guide
├── BUILDER_SUMMARY.md         # Dev summary
└── QUICK_START.md             # This file
```

---

## API Endpoints

### Generate Website
```
POST http://localhost:3000/api/builder-v2/generate-website

Body (multipart/form-data):
- screenshot: PNG image
- polotnoState: JSON string

Response:
{
  "success": true,
  "html": "<html>...",
  "websiteId": "uuid"
}
```

---

## Environment Variables

### Backend `.env`
```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
NODE_ENV=development
```

---

## Best Practices

✅ **Start with template** (saves time)
✅ **Use sections** for organization
✅ **Consistent colors** (2-3 main)
✅ **Optimize images** before upload
✅ **Test generated HTML** in browser
✅ **Export designs** regularly

---

## Resources

📚 **Full Guide**: `BUILDER_GUIDE.md`
📊 **Summary**: `BUILDER_SUMMARY.md`
🔧 **Technical**: `frontend/builder/README.md`

🌐 **Puck Docs**: https://puck.sh/docs
🤖 **Anthropic API**: https://docs.anthropic.com

---

## Next Steps

1. ✅ Start backend & builder
2. 🎨 Load a template
3. 🛠️ Customize components
4. 🚀 Generate website
5. 🌐 Deploy (coming soon)

---

**Questions?** Check `BUILDER_GUIDE.md` or open an issue on GitHub.

**Happy Building! 🎨**
