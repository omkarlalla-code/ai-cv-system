# Component Library Reference

Complete reference for all 30+ components in the BetterCV Builder.

---

## 📐 Layout Components

### Section
**Purpose**: Full-width section container  
**Use For**: Organizing content into distinct areas  

**Key Props**:
- `sectionId` - ID for navigation anchors
- `bgColor` - Background color
- `bgImage` - Background image URL
- `bgOverlay` - Overlay color
- `overlayOpacity` - 0-100
- `paddingTop/Bottom` - Spacing
- `maxWidth` - Container width

**Example Use**:
```
Section (About)
  └── TwoColumn
      ├── Image (profile photo)
      └── Paragraph (bio)
```

---

### Grid
**Purpose**: CSS Grid layout  
**Use For**: Multiple columns of content  

**Key Props**:
- `columns` - 1-6 columns
- `gap` - Space between items
- `alignItems` - Vertical alignment
- `justifyItems` - Horizontal alignment

**Example Use**:
```
Grid (3 columns)
  ├── ProjectCard
  ├── ProjectCard
  └── ProjectCard
```

---

### FlexContainer
**Purpose**: Flexbox layout  
**Use For**: Flexible row/column layouts  

**Key Props**:
- `direction` - row, column, reverse
- `justifyContent` - alignment
- `alignItems` - cross-axis alignment
- `wrap` - Enable wrapping
- `gap` - Space between items

---

### TwoColumn
**Purpose**: Side-by-side layout  
**Use For**: Image + text, feature sections  

**Key Props**:
- `leftWidth` - % width of left column
- `gap` - Space between columns
- `verticalAlign` - Top, center, bottom
- `reverseOnMobile` - Stack order

---

### Card
**Purpose**: Content card container  
**Use For**: Highlighting content blocks  

**Key Props**:
- `bgColor/Image` - Background
- `borderRadius` - Corner rounding
- `shadow` - None, small, medium, large
- `borderColor/Width` - Border styling
- `padding` - Internal spacing

---

### HeroSection
**Purpose**: Hero/banner section  
**Use For**: Homepage header  

**Key Props**:
- `title/titleSize/titleColor`
- `subtitle/subtitleSize/subtitleColor`
- `ctaText/Link` - Call-to-action button
- `bgColor/Image` - Background
- `bgOverlay/Opacity` - Dark overlay
- `minHeight` - Section height
- `textAlign` - Left, center, right

---

### Navbar
**Purpose**: Navigation bar  
**Use For**: Site navigation  

**Key Props**:
- `logo` - Text logo
- `logoImage` - Image logo
- `links` - Format: `Text|#url` (newline separated)
- `bgColor/textColor/accentColor`
- `sticky` - Sticky positioning

**Example Links**:
```
Home|#home
About|#about
Projects|#projects
Contact|#contact
```

---

### Footer
**Purpose**: Page footer  
**Use For**: Copyright, social links  

**Key Props**:
- `text` - Copyright/footer text
- `socialLinks` - Format: `Icon|URL` (newline separated)
- `bgColor/textColor`

**Example Social Links**:
```
💼|https://linkedin.com/in/yourprofile
💻|https://github.com/yourusername
📧|mailto:hello@example.com
```

---

## 📄 CV Components

### EducationCard
**Purpose**: Display education  
**Use For**: Schools, degrees, courses  

**Key Props**:
- `institution` - School name
- `degree` - Degree type
- `field` - Major/subject
- `startYear/endYear` - Years attended
- `grade` - GPA or grade
- `description` - Achievements
- `logo` - School logo
- `bgColor/textColor/accentColor`

---

### ExperienceCard
**Purpose**: Display work experience  
**Use For**: Jobs, internships  

**Key Props**:
- `company` - Company name
- `position` - Job title
- `location` - City, state
- `startDate/endDate` - Employment period
- `description` - Responsibilities
- `technologies` - Comma-separated tech list
- `companyLogo` - Company logo

**Technologies Format**:
```
React, Node.js, PostgreSQL, Docker
```

---

### ProjectCard
**Purpose**: Showcase projects  
**Use For**: Portfolio projects  

**Key Props**:
- `title` - Project name
- `description` - What it does
- `technologies` - Comma-separated
- `image` - Project screenshot
- `githubUrl` - GitHub repository
- `liveUrl` - Live demo
- `date` - Year or date
- `imageHeight` - Screenshot height

**Features**:
- Hover animation
- Technology tags
- Action buttons (GitHub, Live Demo)

---

### SkillBadge
**Purpose**: Individual skill badge  
**Use For**: Single skill display  

**Key Props**:
- `skill` - Skill name
- `level` - beginner, intermediate, advanced, expert
- `icon` - Emoji or image URL
- `bgColor/textColor`
- `showLevel` - Display proficiency indicator

**Level Colors** (auto):
- Beginner: Gray
- Intermediate: Blue
- Advanced: Purple
- Expert: Pink

---

### SkillsGrid
**Purpose**: Grid of multiple skills  
**Use For**: Skills section  

**Key Props**:
- `heading` - Section title
- `skills` - Comma or newline separated
- `columns` - 2-6 columns
- `bgColor`
- `skillBgColor/TextColor`

**Skills Format**:
```
JavaScript
React
Node.js
Python
```
or
```
JavaScript, React, Node.js, Python
```

---

### ContactInfo
**Purpose**: Contact information  
**Use For**: Contact section  

**Key Props**:
- `heading` - Section title
- `email/phone` - Contact details
- `linkedin/github/website` - URLs
- `layout` - vertical, horizontal, grid
- `bgColor/textColor/accentColor`

**Features**:
- Auto-links (mailto, tel, https)
- Icons for each contact type
- Multiple layout options

---

## 🎨 Portfolio Components

### Timeline
**Purpose**: Vertical timeline  
**Use For**: Career journey, milestones  

**Key Props**:
- `heading` - Section title
- `items` - Format: `Year|Title|Description` (newline separated)
- `accentColor` - Line and dots color
- `lineWidth` - Timeline line thickness

**Items Format**:
```
2024|Current Position|Working as Senior Developer
2023|Promotion|Promoted to Team Lead
2022|Started Job|Joined Company X
```

**Features**:
- Alternating sides
- Dot indicators
- Connected timeline line

---

### Testimonial
**Purpose**: Customer/client quote  
**Use For**: Recommendations, reviews  

**Key Props**:
- `quote` - Testimonial text
- `author` - Person's name
- `role` - Their title/position
- `authorImage` - Profile photo
- `bgColor/textColor/accentColor`

---

### StatsSection
**Purpose**: Statistics/metrics  
**Use For**: Achievements, numbers  

**Key Props**:
- `heading` - Section title
- `stats` - Format: `Number|Label` (newline separated)
- `columns` - 2-5 columns
- `bgColor/textColor/accentColor`

**Stats Format**:
```
50+|Projects Completed
100%|Client Satisfaction
5+|Years Experience
20+|Technologies Mastered
```

---

### CTASection
**Purpose**: Call-to-action  
**Use For**: Conversion sections  

**Key Props**:
- `heading` - Main message
- `description` - Supporting text
- `buttonText/Link` - CTA button
- `bgColor/Image` - Background
- `textColor`
- `buttonBgColor/TextColor`

---

## 🔧 Basic Elements

### Heading
**Purpose**: Text headings  
**Use For**: Titles, section headers  

**Key Props**:
- `text` - Heading text
- `level` - h1, h2, h3, h4
- `size` - 16-120px
- `color` - Text color
- `weight` - normal, bold, light
- `align` - left, center, right
- `marginBottom` - Spacing

---

### Paragraph
**Purpose**: Text paragraph  
**Use For**: Body text, descriptions  

**Key Props**:
- `text` - Paragraph content
- `size` - Font size
- `color` - Text color
- `align` - left, center, right, justify
- `lineHeight` - Line spacing
- `marginBottom` - Spacing below

---

### Button
**Purpose**: Interactive button  
**Use For**: CTAs, links  

**Key Props**:
- `text` - Button label
- `link` - URL or anchor
- `bgColor/textColor`
- `size` - Font size
- `paddingX/Y` - Internal spacing
- `borderRadius` - Rounding
- `align` - left, center, right

**Features**:
- Hover animation
- Box shadow on hover

---

### Image
**Purpose**: Image display  
**Use For**: Photos, graphics  

**Key Props**:
- `src` - Image URL or upload
- `alt` - Alt text (accessibility)
- `width` - % of container
- `height` - Fixed height in px
- `objectFit` - cover, contain, fill
- `borderRadius` - Corner rounding
- `align` - left, center, right

---

### Box
**Purpose**: Container/wrapper  
**Use For**: Grouping content  

**Key Props**:
- `bgColor/Image` - Background
- `padding` - Internal spacing
- `borderRadius` - Corner rounding
- `minHeight` - Minimum height

**Accepts Children**: Yes

---

### Spacer
**Purpose**: Vertical spacing  
**Use For**: Adding space between elements  

**Key Props**:
- `height` - 10-200px

**Use Cases**:
- Separate sections
- Add breathing room
- Adjust layout spacing

---

### Divider
**Purpose**: Horizontal line  
**Use For**: Visual separation  

**Key Props**:
- `color` - Line color
- `thickness` - 1-10px
- `width` - % of container
- `marginTop/Bottom` - Spacing

---

## 🎯 Usage Patterns

### Hero + About + Skills
```
HeroSection
  ├── title: "Your Name"
  ├── subtitle: "Your Role"
  └── CTA: "View Work"

Section (ID: about)
  └── TwoColumn
      ├── Image (profile)
      └── Paragraph (bio)

SkillsGrid
  └── skills: "React, Node, Python..."
```

### Project Showcase
```
Section (ID: projects)
  ├── Heading: "My Projects"
  └── Grid (3 columns)
      ├── ProjectCard (Project 1)
      ├── ProjectCard (Project 2)
      └── ProjectCard (Project 3)
```

### Experience Timeline
```
Section
  └── Timeline
      └── items:
          "2024|Role|Description
           2023|Role|Description"
```

### Contact Section
```
CTASection
  ├── heading: "Let's Work Together"
  ├── description: "Get in touch"
  └── button: "Contact Me"

ContactInfo
  ├── email
  ├── phone
  ├── linkedin
  └── github
```

---

## 🎨 Styling Tips

### Color Coordination
- Choose 2-3 main colors
- Use ColorPicker presets for consistency
- Use accent color for important elements

### Spacing
- Use Spacers between major sections
- Keep consistent padding in Cards
- Use Grid/Flex gap for even spacing

### Typography
- H1: 48-72px (heroes)
- H2: 32-48px (section headings)
- H3: 24-32px (card headings)
- Body: 16-18px (paragraphs)

### Images
- Optimize before upload (<500KB ideal)
- Use consistent aspect ratios
- Add alt text for accessibility

---

## 🚀 Pro Component Combos

### Feature Section
```
Section
  └── Grid (2 columns)
      ├── Card
      │   ├── Heading
      │   └── Paragraph
      └── Card
          ├── Heading
          └── Paragraph
```

### About Me
```
TwoColumn
  ├── Image (profile)
  └── Box
      ├── Heading ("About Me")
      ├── Paragraph (bio)
      └── Button ("Download CV")
```

### Skills Showcase
```
Section
  ├── Heading ("Skills")
  ├── SkillsGrid
  ├── Spacer (40px)
  └── Paragraph ("Additional info")
```

### Project Detail
```
Card
  ├── Image (screenshot)
  ├── Heading (title)
  ├── Paragraph (description)
  └── FlexContainer
      ├── Button ("GitHub")
      └── Button ("Live Demo")
```

---

**Reference**: This document covers all components. For usage examples, see `BUILDER_GUIDE.md`.
