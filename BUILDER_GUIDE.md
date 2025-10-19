# BetterCV Puck Builder - Complete Guide

## 🎉 What's New

The Puck-based builder has been **significantly enhanced** with:

### ✅ **30+ Professional Components**
- **Layout**: Section, Grid, Flex, TwoColumn, Card, HeroSection, Navbar, Footer
- **CV Components**: EducationCard, ExperienceCard, ProjectCard, SkillBadge, SkillsGrid, ContactInfo
- **Portfolio**: Timeline, Testimonial, StatsSection, CTASection
- **Basic Elements**: Heading, Paragraph, Button, Image, Box, Spacer, Divider

### ✅ **Template System**
- **Developer Portfolio**: Full-featured template with navbar, hero, skills, CTA
- **Minimal**: Clean, minimal design
- **Blank**: Start from scratch

### ✅ **Advanced Features**
- Color picker with 24 presets + custom HEX input
- Image upload (URL or file upload, max 5MB)
- Import/Export designs as JSON
- AI-powered website generation (screenshot → responsive HTML/CSS)

---

## 🚀 Quick Start

### 1. **Start the Builder**

```bash
cd frontend/builder
npm install
npm run dev
```

Builder will be at: `http://localhost:3001`

### 2. **Start the Backend** (for AI generation)

```bash
cd backend
npm install
npm run dev
```

Backend API will be at: `http://localhost:3000`

Make sure `.env` has:
```env
ANTHROPIC_API_KEY=your_key_here
```

---

## 📚 Component Guide

### **Layout Components**

#### **Section**
Full-width section container with:
- Background color/image
- Overlay with opacity control
- Padding controls
- Max width options (none, 900px, 1200px, 1400px)
- Section IDs for navigation

#### **Grid**
CSS Grid layout with:
- 1-6 columns
- Gap control
- Align/justify items
- Padding

#### **FlexContainer**
Flexbox layout with:
- Direction (row, column, reverse)
- Justify content
- Align items
- Wrap control
- Gap

#### **TwoColumn**
Two-column layout with:
- Adjustable column widths (%)
- Gap control
- Vertical alignment
- Reverse on mobile option

#### **Card**
Content card with:
- Background color/image
- Border radius
- Padding
- Shadow (none, small, medium, large)
- Border styling

#### **HeroSection**
Hero/banner section with:
- Title & subtitle with size controls
- CTA button
- Background image with overlay
- Min height control
- Text alignment

#### **Navbar**
Navigation bar with:
- Logo text/image
- Multiple nav links
- Sticky/static positioning
- Color customization

#### **Footer**
Footer section with:
- Copyright text
- Social links with icons
- Color customization

---

### **CV Components**

#### **EducationCard**
Displays education with:
- Institution name & logo
- Degree & field
- Years & GPA
- Description
- Full styling control

#### **ExperienceCard**
Work experience with:
- Company name & logo
- Position & location
- Date range
- Description
- Technology tags

#### **ProjectCard**
Project showcase with:
- Project image
- Title & description
- Technology tags
- GitHub & live demo links
- Hover effects

#### **SkillBadge**
Individual skill with:
- Skill name
- Proficiency level (beginner/intermediate/advanced/expert)
- Icon support (emoji or image)
- Color customization

#### **SkillsGrid**
Grid of skills with:
- Section heading
- Multiple skills (comma/newline separated)
- Column count (2-6)
- Color customization

#### **ContactInfo**
Contact information with:
- Email, phone
- LinkedIn, GitHub, website
- Layout options (vertical/horizontal/grid)
- Color customization

---

### **Portfolio Components**

#### **Timeline**
Vertical timeline with:
- Year/title/description items
- Alternating sides
- Custom line width & color
- Accent color

#### **Testimonial**
Quote/testimonial with:
- Quote text
- Author name, role
- Author image
- Color customization

#### **StatsSection**
Statistics/metrics with:
- Multiple stats (number|label format)
- Column count (2-5)
- Background & accent colors

#### **CTASection**
Call-to-action with:
- Heading & description
- Button with link
- Background image support
- Color customization

---

### **Basic Elements**

#### **Heading**
Text heading with:
- H1-H4 levels
- Size (16-120px)
- Color, weight, alignment
- Margin control

#### **Paragraph**
Text paragraph with:
- Size, color, alignment
- Line height
- Margin control

#### **Button**
Interactive button with:
- Text & link
- Colors (background, text)
- Size, padding
- Border radius
- Alignment

#### **Image**
Image element with:
- URL or upload
- Width (%), height (px)
- Object fit (cover, contain, fill)
- Border radius
- Alignment

#### **Box**
Container with:
- Background color/image
- Padding
- Border radius
- Min height

#### **Spacer**
Vertical spacing with:
- Height (10-200px)

#### **Divider**
Horizontal line with:
- Color, thickness
- Width (%)
- Margins

---

## 🎨 Using the Builder

### **Adding Components**

1. Open **component panel** (left side)
2. Click category: Layout, CV, Portfolio, Basic
3. **Drag component** to canvas
4. **Drop** where you want it

### **Editing Components**

1. **Click component** on canvas
2. Edit in **properties panel** (right side)
3. Change text, colors, images
4. Adjust spacing, sizes
5. See **live preview**

### **Color Picker**

- Click color field
- Choose from **24 presets**
- Use **color picker** wheel
- Enter **HEX code** manually

### **Image Upload**

**URL Mode:**
- Paste image URL
- Press Enter or ✓

**Upload Mode:**
- Click "Choose Image"
- Select file (max 5MB)
- Supports JPG, PNG, GIF, WebP

### **Templates**

1. Click **"📋 Templates"**
2. Choose template:
   - **Blank**: Empty canvas
   - **Developer**: Full portfolio
   - **Minimal**: Clean design
3. Customize to your needs

### **Export/Import**

**Export:**
- Click **"💾 Export"**
- Downloads `design.json`
- Save for later

**Import:**
- Click **"📥 Import"**
- Select `.json` file
- Design loads instantly

---

## 🤖 AI Website Generation

### **How It Works**

1. **Design** your portfolio visually
2. Click **"🚀 Generate Website"**
3. Builder captures screenshot
4. Sends to **Claude 3.5 Sonnet**
5. AI analyzes design
6. Generates **responsive HTML/CSS**
7. Auto-downloads `portfolio.html`

### **AI Features**

✅ **Mobile-first responsive**
✅ **Semantic HTML5**
✅ **Modern CSS** (Grid, Flexbox)
✅ **Accessibility** (ARIA, alt text)
✅ **Google Fonts integration**
✅ **Optimized performance**

### **Requirements**

- Backend running on port 3000
- `ANTHROPIC_API_KEY` set
- At least one component on canvas

---

## 💡 Pro Tips

### **Building a Great Portfolio**

1. **Start with a template** (saves time)
2. **Use Hero section** at top
3. **Add Navbar** for navigation
4. **Organize with Sections**
5. **Show projects** with ProjectCard
6. **List skills** with SkillsGrid
7. **Add CTA** at bottom
8. **End with Footer**

### **Design Best Practices**

✅ **Consistent colors** (2-3 main colors)
✅ **Readable fonts** (16px+ for body)
✅ **White space** (use Spacers)
✅ **High-quality images**
✅ **Clear hierarchy** (headings)
✅ **Mobile-friendly** (avoid tiny text)

### **Performance**

- Optimize images before upload
- Use web-optimized formats (WebP, JPEG)
- Keep image sizes reasonable (<500KB)
- Test generated HTML in browser

---

## 🛠️ Troubleshooting

### **"Preview not found" error**

**Cause:** Canvas not loaded
**Fix:** Wait for builder to load fully

### **"Failed to generate" error**

**Possible causes:**
1. Backend not running → Start backend
2. No API key → Set `ANTHROPIC_API_KEY`
3. API key invalid → Check key
4. Rate limit → Wait a moment

**Fix:**
```bash
# Check backend .env
cat backend/.env | grep ANTHROPIC

# Restart backend
cd backend
npm run dev
```

### **Image won't upload**

**Possible causes:**
1. File too large (>5MB)
2. Wrong format
3. Corrupted file

**Fix:**
- Compress image
- Use JPG/PNG
- Try URL mode instead

### **Component not appearing**

**Fix:**
- Check if dropped in correct location
- Try refreshing page
- Clear browser cache

---

## 🔧 Advanced Usage

### **Custom Layouts**

Combine components creatively:

```
Section
  └── TwoColumn
      ├── (Left) Image
      └── (Right) Box
          ├── Heading
          ├── Paragraph
          └── Button
```

### **Responsive Design**

- Use **%** for widths (not px)
- **Max-width** on Sections
- **Grid** for auto-responsive layouts
- Test on different screen sizes

### **Nested Components**

Some components accept children:
- **Section** → any components
- **Grid** → multiple items
- **FlexContainer** → multiple items
- **TwoColumn** → 2 items (left/right)
- **Card** → any components
- **Box** → any components

---

## 📖 Example Workflows

### **Creating a Developer Portfolio**

1. Load **Developer template**
2. Edit **Navbar** → Change name, links
3. Edit **Hero** → Update title, subtitle
4. Add **Section** with ID "about"
5. Inside Section, add **TwoColumn**
6. Left: Add **Image** (your photo)
7. Right: Add **Paragraph** (bio)
8. Add **SkillsGrid** → List your skills
9. Add **Section** with ID "projects"
10. Add **Grid** (3 columns)
11. Add 3x **ProjectCard** → Your projects
12. Edit **CTASection** → Your CTA
13. Edit **Footer** → Your socials
14. Click **Generate Website**

### **Quick Portfolio from Scratch**

1. Click **Blank** template
2. Add **HeroSection** → Name, tagline
3. Add **SkillsGrid** → Key skills
4. Add **Grid** (2 columns)
5. Add 2x **ProjectCard** → Top projects
6. Add **ContactInfo** → Email, socials
7. Click **Generate Website**

---

## 📊 Component Cheat Sheet

| Component | Use For | Key Props |
|-----------|---------|-----------|
| HeroSection | Homepage banner | Title, subtitle, CTA |
| Navbar | Navigation | Logo, links |
| Section | Page sections | ID, background |
| Grid | Multi-column | Columns, gap |
| TwoColumn | Side-by-side | Left width |
| EducationCard | Schools | Institution, degree |
| ExperienceCard | Jobs | Company, role |
| ProjectCard | Projects | Image, links |
| SkillsGrid | Skills | Skills list |
| Timeline | Journey | Year, events |
| CTASection | Call-to-action | Heading, button |
| Footer | Bottom bar | Text, socials |

---

## 🚀 Next Steps

1. **Explore components** in each category
2. **Load a template** to see structure
3. **Customize** to match your style
4. **Generate** HTML/CSS with AI
5. **Deploy** to your subdomain (coming soon)

---

## 📝 Notes

- Designs are **auto-saved** in browser
- Use **Export** for backup
- Generated HTML is **production-ready**
- All components are **fully customizable**
- Builder works **offline** (except AI generation)

---

**Happy Building! 🎨**

For questions or issues, check the main README or open an issue on GitHub.
