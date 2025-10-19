# BetterCV Visual Builder

A powerful React-based visual website builder that allows students to design their portfolio websites using drag-and-drop components, then automatically converts designs to production-ready HTML/CSS using Claude AI's vision capabilities.

## Features

### Visual Design
- **Drag-and-Drop Interface**: Powered by Puck, an intuitive visual editor
- **Pre-built Components**: Hero sections, About, Skills, Projects, Contact forms
- **Full Styling Control**: Customize colors, fonts, spacing, images
- **Live Preview**: See changes in real-time as you build

### AI-Powered Code Generation
- **Screenshot to Code**: Captures your visual design and converts it to HTML/CSS
- **Claude Vision API**: Uses Claude 3.5 Sonnet for accurate design-to-code conversion
- **Production-Ready Output**: Clean, semantic HTML5 with embedded CSS
- **Responsive Design**: Generated code is mobile-first and fully responsive

### Component Library

#### Hero
- Title, subtitle, background image
- Call-to-action button
- Gradient backgrounds

#### About
- Heading and content
- Profile image support
- Flexible layout

#### Skills
- Comma-separated skill list
- Tag-based display
- Customizable styling

#### Projects
- Multiple project cards
- Image support
- Project descriptions

#### Contact
- Email, phone, social links
- Clean contact form layout

#### Utilities
- Text blocks with custom styling
- Spacers for layout control

## Getting Started

### Prerequisites
- Node.js 16+
- Backend API running on port 5000 (or 3000)
- Anthropic API key configured in backend

### Installation

```bash
cd frontend/builder
npm install
```

### Configuration

Ensure your backend has the `ANTHROPIC_API_KEY` set in `.env`:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### Running the Builder

```bash
npm run dev
```

The builder will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Flow

1. **Design**: Drag components from the left panel onto the canvas
2. **Customize**: Click any component to edit its properties (text, colors, images)
3. **Preview**: See your design in the center preview panel
4. **Save**: Click "Save Design" to store your work locally
5. **Generate**: Click "Generate HTML/CSS" to:
   - Capture a screenshot of your design
   - Send it to Claude AI for analysis
   - Receive production-ready HTML/CSS
   - Automatically download the result

## API Endpoints

### POST `/api/builder/generate-code`
Generates HTML/CSS from a design screenshot.

**Request:**
- `screenshot`: Image file (PNG/JPG)
- `data`: JSON string of Puck design data (optional)

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>...",
  "filePath": "/path/to/generated/file.html",
  "message": "HTML/CSS code generated successfully"
}
```

### POST `/api/builder/refine-code`
Refines existing HTML/CSS based on user feedback.

**Request:**
```json
{
  "html": "existing HTML code",
  "feedback": "Make the header larger and change colors to blue"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>...",
  "message": "Code refined successfully"
}
```

## Architecture

```
┌─────────────────────────────────────────────┐
│   React Builder (Puck)                      │
│   - Component Library                       │
│   - Visual Editor                           │
│   - Live Preview                            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ html-to-image  │
         │ Screenshot     │
         └────────┬────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │  Backend API                │
    │  /api/builder/generate-code │
    └─────────────┬───────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Claude Vision  │
         │ API (Sonnet)   │
         └────────┬────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │  HTML/CSS Generation        │
    │  - Semantic markup          │
    │  - Responsive design        │
    │  - Accessibility            │
    └─────────────────────────────┘
```

## Technology Stack

- **React 19**: UI framework
- **Puck**: Visual page builder
- **Vite**: Build tool and dev server
- **html-to-image**: Screenshot capture
- **Anthropic SDK**: Claude AI integration
- **Express**: Backend API (in main backend)

## Design Principles

### Output Quality
The AI is prompted to generate:
- Semantic HTML5 (header, nav, section, etc.)
- Mobile-first responsive CSS
- Accessibility features (ARIA, alt text)
- Modern CSS (Flexbox, Grid, custom properties)
- Cross-browser compatibility

### User Experience
- No prompt engineering required from students
- AI works invisibly in the background
- Instant visual feedback
- One-click code generation

## Integration with Main System

The builder is designed to integrate with the existing BetterCV system:

1. Students access builder from dashboard
2. Design their portfolio visually
3. Generate HTML/CSS automatically
4. Deploy to their subdomain (username.bettercv.com)
5. Can still use traditional CV upload as alternative

## Development

### Project Structure
```
builder/
├── src/
│   ├── components/
│   │   └── puck-config.jsx    # Component definitions
│   ├── App.jsx                # Main builder app
│   ├── App.css                # Styling
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

### Adding New Components

Edit `src/components/puck-config.jsx`:

```javascript
export const config = {
  components: {
    YourComponent: {
      fields: {
        title: { type: 'text' },
        // ... more fields
      },
      defaultProps: {
        title: 'Default Title',
      },
      render: ({ title }) => (
        <div>{title}</div>
      ),
    },
  },
};
```

## Troubleshooting

### Screenshot not capturing
- Ensure `.Puck-preview` element exists in DOM
- Check browser console for CORS issues

### API errors
- Verify backend is running on correct port
- Check ANTHROPIC_API_KEY is set
- Ensure CORS allows requests from port 3001

### Generated code issues
- Try refining with feedback endpoint
- Check Claude API rate limits
- Verify image quality/size is adequate

## Future Enhancements

- [ ] More component types (testimonials, gallery, timeline)
- [ ] Custom CSS editor
- [ ] Template marketplace
- [ ] Real-time collaboration
- [ ] Version history
- [ ] A/B testing different designs
- [ ] Direct deployment integration

## License

MIT - Part of the BetterCV System by Omkar Nitin Lalla
