# your iCal - Calendar Event Generator

A modern web application that generates personalized event calendars for any location worldwide. Built with Vue.js 3, TypeScript, and Express.js, this application integrates with real event APIs to create downloadable .ics calendar files.

![your iCal Logo](./frontend/src/assets/logo-preview.png)

## 🌟 Features

### Frontend
- **Modern Vue.js 3** with TypeScript and Composition API
- **Intelligent Location Search** using OpenStreetMap Nominatim API
- **Real-time Event Categories** loaded from backend
- **Responsive Design** with Tailwind CSS 4 and green theme
- **Glass Morphism Effects** and modern UI components
- **Accessibility First** with proper ARIA labels and keyboard navigation

### Backend
- **Express.js API** with comprehensive Swagger documentation
- **PredictHQ Integration** for real-world event data
- **Smart Fallback System** when API data is unavailable
- **iCalendar Generation** (.ics files) compatible with all major calendar apps
- **Location-based Filtering** within 50km radius of selected city
- **Flexible Duration** from 1 to 12 weeks of events

### Event Categories
- Public Holidays
- Festivals & Concerts
- Sports Events
- Academic Events
- Conferences
- Community Events
- And more...

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Optional: PredictHQ API token (for real event data)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calendar-cron
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   pnpm install

   # Install frontend dependencies
   cd frontend
   pnpm install
   cd ..
   ```

3. **Environment Setup** (Optional)
   ```bash
   # Create .env file in root directory
   echo "PREDICTHQ_TOKEN=your_token_here" > .env
   ```
   > **Note**: The app works without a PredictHQ token using intelligent fallback events

4. **Build the frontend**
   ```bash
   cd frontend
   pnpm run build
   cd ..
   ```

5. **Start the server**
   ```bash
   pnpm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Architecture

### Frontend (`/frontend`)
```
src/
├── components/
│   ├── Logo.vue              # Custom SVG brand logo
│   ├── LocationSearch.vue    # Intelligent city search
│   └── CalendarForm.vue      # Main form component
├── main.ts                   # Application entry point
├── App.vue                   # Root component
└── style.css                 # Tailwind CSS imports
```

### Backend (`/`)
```
├── server.js                 # Express.js main server
├── utils.js                  # Calendar generation utilities
├── package.json              # Dependencies and scripts
└── public/                   # Built frontend assets
```

## 🔧 API Documentation

The API includes comprehensive Swagger documentation available at `/api-docs` when the server is running.

### Key Endpoints

#### `GET /api/categories`
Returns available event categories for selection.

**Response:**
```json
[
  {
    "value": "public-holidays",
    "label": "Public Holidays"
  },
  {
    "value": "festivals",
    "label": "Festivals"
  }
]
```

#### `POST /api/generate-calendar`
Generates a calendar for the specified location and preferences.

**Request Body:**
```json
{
  "location": "50km@52.5200,13.4050",
  "categories": "public-holidays,festivals,concerts",
  "weeks": 4,
  "cityName": "Berlin"
}
```

**Response:**
```json
{
  "success": true,
  "eventCount": 23,
  "downloadUrl": "/download/calendar-1234567890.ics"
}
```

## 🎨 Design System

### Color Palette
The application uses a professional green color scheme:

- **Primary Green**: `#22c55e` (green-500)
- **Dark Green**: `#16a34a` (green-600)
- **Light Green**: `#f0fdf6` (green-50)
- **Accent Colors**: Various green shades for visual hierarchy

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Components
All components use Tailwind CSS utilities with custom design tokens:
- Glass morphism effects (`bg-white/80 backdrop-blur-sm`)
- Consistent border radius (`rounded-xl`, `rounded-2xl`)
- Smooth transitions (`transition-all duration-200`)
- Hover effects with transforms and shadows

## 🔌 API Integration

### PredictHQ Integration
The application integrates with PredictHQ for real-world event data:
- Automatic location-based filtering
- Category-specific event retrieval
- Date range optimization
- Rate limiting and error handling

### Fallback System
When PredictHQ is unavailable, the system generates realistic events:
- Location-appropriate event names
- Varied timing and durations
- Proper category distribution
- Realistic event scheduling

### OpenStreetMap Integration
Location search powered by Nominatim API:
- Real-time city/location search
- Geographic coordinate conversion
- Location type filtering (cities, towns, villages)
- Debounced search for performance

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: ES2020, CSS Grid, Flexbox, CSS Custom Properties

## 🧪 Development

### Frontend Development
```bash
cd frontend
pnpm run dev          # Start Vite dev server
pnpm run build        # Build for production
pnpm run type-check   # TypeScript type checking
```

### Backend Development
```bash
# Start with nodemon for auto-reload
npx nodemon server.js

# Or start normally
node server.js
```

### Code Quality
- **TypeScript**: Full type safety with strict mode
- **Vue 3 Composition API**: Modern reactive patterns
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting

## 🚀 Deployment

### Vercel Deployment (Recommended)

The application is specifically optimized for **Vercel's serverless platform**:

#### Architecture for Vercel
- **Single Repository**: Frontend and backend combined in one repo
- **Serverless Functions**: Express.js runs as Vercel serverless functions
- **In-Memory Storage**: Calendar files streamed directly (no disk storage)
- **Automatic Scaling**: Handles traffic spikes automatically

#### Deployment Steps

1. **Prepare and Push to GitHub**
   ```bash
   # Ensure frontend is built
   cd frontend && pnpm run build && cd ..
   
   # Commit and push
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Import Project" and select your GitHub repo
   - Vercel will auto-detect the configuration from `vercel.json`
   - **Important**: No manual configuration needed - everything is in `vercel.json`
   - Set environment variables (optional):
     - `PREDICTHQ_TOKEN`: Your PredictHQ API token

3. **Alternative: CLI Deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

4. **Vercel Configuration Details**
   ```json
   {
     "builds": [
       { "src": "server.js", "use": "@vercel/node" },
       { "src": "frontend/package.json", "use": "@vercel/static-build" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/server.js" },
       { "src": "/(.*)", "dest": "/server.js" }
     ]
   }
   ```

#### How File Storage Works on Vercel

**❌ Traditional Approach (Won't Work on Vercel):**
```javascript
// This fails on serverless - files disappear between requests
fs.writeFileSync('./calendar.ics', content)
```

**✅ Our Serverless Solution:**
```javascript
// Stream content directly from memory
res.setHeader('Content-Type', 'text/calendar')
res.send(calendarContent)  // Direct streaming
```

#### Benefits of This Architecture
- **No File Storage Needed**: Calendar content streamed directly
- **Instant Downloads**: No intermediate file creation
- **Memory Efficient**: Files cleaned up after download
- **Scalable**: Works with Vercel's auto-scaling
- **Secure**: No persistent files on disk

### Manual Deployment

For other platforms:

1. **Build the application**
   ```bash
   cd frontend
   pnpm run build
   cd ..
   ```

2. **Set environment variables**
   ```bash
   export PREDICTHQ_TOKEN=your_token
   export PORT=3000
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 🔒 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PREDICTHQ_TOKEN` | PredictHQ API authentication token | No | Fallback events used |
| `PORT` | Server port number | No | 3000 |

## 📄 File Structure

```
calendar-cron/
├── frontend/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/      # Vue components
│   │   ├── main.ts         # Application entry
│   │   ├── App.vue         # Root component
│   │   └── style.css       # Tailwind imports
│   ├── public/             # Static assets
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── tsconfig.json       # TypeScript configuration
│   └── vite.config.ts      # Vite build configuration
├── public/                 # Built frontend assets (generated)
├── server.js              # Express.js backend server
├── utils.js               # Calendar utilities
├── package.json           # Backend dependencies
├── .env                   # Environment variables (optional)
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing component patterns
- Maintain the green design theme
- Write comprehensive comments
- Test across different browsers
- Ensure mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Deployed on Vercel]
- **API Documentation**: `/api-docs` (when server is running)
- **PredictHQ API**: [https://www.predicthq.com/](https://www.predicthq.com/)
- **OpenStreetMap Nominatim**: [https://nominatim.org/](https://nominatim.org/)

## 💡 Technical Highlights

### Frontend
- **Vue 3 Composition API** with TypeScript for type-safe reactive programming
- **Tailwind CSS 4** for utility-first styling and consistent design
- **Axios** for HTTP requests with proper error handling
- **Debounced search** for optimal API usage and user experience
- **Component-based architecture** for maintainable and reusable code

### Backend
- **Express.js** with modern ES6+ features
- **Swagger/OpenAPI** for comprehensive API documentation
- **Graceful error handling** with user-friendly error messages
- **Environment-based configuration** for development and production
- **Static file serving** for single-page application hosting

### DevOps
- **Vite** for fast development and optimized production builds
- **TypeScript** for compile-time error checking and better IDE support
- **pnpm** for efficient package management
- **Vercel** ready deployment configuration

---

**Built with ❤️ by the Calendar App Team**

*Generate your perfect calendar in seconds!*