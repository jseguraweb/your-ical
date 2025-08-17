/**
 * Calendar Event Generator - Express.js Backend Server
 * 
 * This Express.js server provides the backend API for the "your iCal" calendar generation service.
 * It integrates with PredictHQ API to fetch real events and generates downloadable .ics calendar files.
 * 
 * Key Features:
 * - RESTful API endpoints for calendar generation
 * - PredictHQ API integration for real event data
 * - Fallback event generation when API data is unavailable
 * - iCalendar (.ics) file generation for calendar imports
 * - Swagger/OpenAPI documentation
 * - Static file serving for Vue.js frontend
 * - CORS support for development
 * 
 * API Endpoints:
 * - GET  /api/categories          - List available event categories
 * - POST /api/generate-calendar   - Generate calendar for location and preferences
 * - GET  /api-docs                - Swagger API documentation
 * - GET  /                        - Serve Vue.js frontend application
 * 
 * Environment Variables:
 * - PREDICTHQ_TOKEN: API token for PredictHQ service (optional, has fallback)
 * - PORT: Server port (default: 3000)
 * 
 * Dependencies:
 * - express: Web framework for Node.js
 * - axios: HTTP client for API requests
 * - swagger-ui-express: API documentation interface
 * - ical-generator: Library for creating .ics calendar files
 * 
 * @author Calendar App Team
 * @version 1.0.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { normalizeEvents, generateICalendar } = require('./utils');

// Load environment variables
try {
  const envPath = path.join(__dirname, '.env');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log('No .env file found or error reading it');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calendar Event Generator API',
      version: '1.0.0',
      description: 'Generate personalized event calendars for any location and interests',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Location: {
          type: 'object',
          properties: {
            coordinates: {
              type: 'string',
              example: '50km@52.5200,13.4050',
              description: 'Location in format: radius@latitude,longitude'
            },
            displayName: {
              type: 'string',
              example: 'Berlin, Germany'
            }
          }
        },
        CalendarRequest: {
          type: 'object',
          required: ['location', 'categories'],
          properties: {
            location: {
              type: 'string',
              example: '50km@52.5200,13.4050',
              description: 'Location in format: radius@latitude,longitude'
            },
            categories: {
              type: 'string',
              example: 'concerts,festivals,sports',
              description: 'Comma-separated list of event categories'
            },
            weeks: {
              type: 'integer',
              example: 4,
              minimum: 1,
              maximum: 12,
              description: 'Number of weeks for the calendar'
            },
            cityName: {
              type: 'string',
              example: 'Berlin',
              description: 'City name for location-specific events'
            }
          }
        },
        CalendarResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            downloadUrl: {
              type: 'string',
              example: '/events-1234567890.ics'
            },
            eventCount: {
              type: 'integer',
              example: 35
            },
            message: {
              type: 'string',
              example: 'Calendar generated successfully'
            }
          }
        },
        Category: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
              example: 'concerts'
            },
            label: {
              type: 'string',
              example: 'Concerts'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Location is required'
            },
            details: {
              type: 'string',
              example: 'Additional error details'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js'], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());

// Serve static files - check multiple possible locations for Vercel compatibility
if (fs.existsSync(path.join(__dirname, 'public'))) {
  // Local development
  app.use(express.static(path.join(__dirname, 'public')));
} else if (fs.existsSync(path.join(__dirname, 'frontend/dist'))) {
  // Vercel deployment
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
}

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Calendar API Documentation'
}));

// PredictHQ API constants
const PREDICTHQ_API_URL = 'https://api.predicthq.com/v1/events/';
const PREDICTHQ_TOKEN = process.env.PREDICTHQ_TOKEN;

// Helper function to generate location-specific sample events
function generateLocationEvents(locationInfo, categories, weeks) {
  const events = [];
  const categoryList = categories.split(',');
  const startDate = new Date();
  // Start events from tomorrow instead of today
  startDate.setDate(startDate.getDate() + 1);
  
  // Extract city name from location coordinates or use a default
  const cityName = locationInfo.cityName || 'Local Area';
  
  // Sample event templates for different categories
  const eventTemplates = {
    'public-holidays': [
      `${cityName} Public Holiday Celebration`,
      `National Day in ${cityName}`,
      `${cityName} Heritage Festival`
    ],
    'festivals': [
      `${cityName} Music Festival`,
      `${cityName} Art & Culture Festival`,
      `${cityName} Food & Wine Festival`,
      `${cityName} International Film Festival`,
      `${cityName} Street Art Festival`
    ],
    'concerts': [
      `Classical Concert at ${cityName} Concert Hall`,
      `Jazz Night in ${cityName}`,
      `Rock Concert - ${cityName} Arena`,
      `Chamber Music at ${cityName} Opera House`,
      `Electronic Music Festival ${cityName}`
    ],
    'sports': [
      `${cityName} Football Match`,
      `${cityName} Basketball Tournament`,
      `${cityName} Marathon`,
      `Tennis Open ${cityName}`,
      `${cityName} Cycling Championship`
    ],
    'academic': [
      `${cityName} University Conference`,
      `Research Symposium ${cityName}`,
      `Academic Workshop at ${cityName}`,
      `Student Exchange Program ${cityName}`
    ],
    'conferences': [
      `Tech Conference ${cityName}`,
      `Business Summit ${cityName}`,
      `Innovation Forum ${cityName}`,
      `Startup Meetup ${cityName}`
    ],
    'performing-arts': [
      `Theatre Performance ${cityName}`,
      `Opera Gala ${cityName}`,
      `Ballet Show ${cityName}`,
      `Comedy Night ${cityName}`
    ]
  };
  
  // Generate events for the specified duration
  for (let week = 0; week < weeks; week++) {
    for (let day = 0; day < 7; day++) {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + (week * 7) + day);
      
      // Generate 2-3 events per day
      const eventsPerDay = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < eventsPerDay; i++) {
        const category = categoryList[Math.floor(Math.random() * categoryList.length)];
        const templates = eventTemplates[category] || eventTemplates['festivals'];
        const title = templates[Math.floor(Math.random() * templates.length)];
        
        // Create realistic event start times (9 AM to 8 PM)
        const eventStartTime = new Date(eventDate);
        const startHour = 9 + Math.floor(Math.random() * 12); // 9 AM to 8 PM
        const startMinute = Math.random() > 0.5 ? 0 : 30; // Either :00 or :30
        eventStartTime.setHours(startHour, startMinute, 0, 0);
        
        // Event duration: 1-4 hours
        const durationHours = 1 + Math.random() * 3;
        const eventEndTime = new Date(eventStartTime.getTime() + durationHours * 60 * 60 * 1000);
        
        events.push({
          title: title,
          start: eventStartTime.toISOString(),
          end: eventEndTime.toISOString(),
          category: category
        });
      }
    }
  }
  
  return events.slice(0, 140); // Limit to reasonable number
}

/**
 * @swagger
 * /api/generate-calendar:
 *   post:
 *     summary: Generate a calendar with events for a specific location
 *     description: Creates a personalized iCalendar file with events based on location, categories, and duration preferences
 *     tags: [Calendar]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalendarRequest'
 *           examples:
 *             berlin:
 *               summary: Berlin events for 4 weeks
 *               value:
 *                 location: "50km@52.5200,13.4050"
 *                 categories: "concerts,festivals,sports"
 *                 weeks: 4
 *                 cityName: "Berlin"
 *             london:
 *               summary: London events for 2 weeks  
 *               value:
 *                 location: "50km@51.5074,-0.1278"
 *                 categories: "public-holidays,festivals"
 *                 weeks: 2
 *                 cityName: "London"
 *     responses:
 *       200:
 *         description: Calendar generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalendarResponse'
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/generate-calendar', async (req, res) => {
  try {
    const { location, categories, weeks = 4, cityName } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    let events = [];
    let useGeneratedEvents = false;

    // Try to fetch from PredictHQ first
    if (PREDICTHQ_TOKEN) {
      try {
        const headers = {
          'Authorization': `Bearer ${PREDICTHQ_TOKEN}`
        };

        const params = {
          limit: 140,
          category: categories || 'public-holidays,observances,academic,conferences,concerts,festivals,performing-arts,sports',
          'start.gte': new Date().toISOString().split('T')[0],
          'start.lte': new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          'location.within': location
        };

        console.log('Fetching events from PredictHQ with params:', params);

        const response = await axios.get(PREDICTHQ_API_URL, {
          headers,
          params
        });

        const predictHQEvents = response.data.results || [];
        console.log(`Fetched ${predictHQEvents.length} events from PredictHQ`);
        
        // Check if events are actually from the requested location
        if (predictHQEvents.length > 0) {
          const [radius, coords] = location.split('@');
          const [targetLat, targetLon] = coords.split(',').map(Number);
          
          // Check if any events are reasonably close to target location
          const localEvents = predictHQEvents.filter(event => {
            if (!event.location || !Array.isArray(event.location)) return false;
            const [eventLon, eventLat] = event.location;
            const distance = Math.sqrt(
              Math.pow(eventLat - targetLat, 2) + Math.pow(eventLon - targetLon, 2)
            );
            return distance < 1; // Within ~100km (rough calculation)
          });
          
          console.log(`Found ${localEvents.length} events near target location`);
          
          if (localEvents.length >= 10) {
            events = localEvents;
          } else {
            console.log('Not enough local events found, generating location-specific events');
            useGeneratedEvents = true;
          }
        } else {
          useGeneratedEvents = true;
        }
      } catch (predictHQError) {
        console.log('PredictHQ API error, falling back to generated events:', predictHQError.message);
        useGeneratedEvents = true;
      }
    } else {
      useGeneratedEvents = true;
    }

    // Generate location-specific events if needed
    if (useGeneratedEvents) {
      console.log('Generating location-specific sample events');
      events = generateLocationEvents({ cityName }, categories, weeks);
    }

    if (events.length === 0) {
      return res.status(404).json({ error: 'No events found for the specified criteria' });
    }

    const normalizedEvents = normalizeEvents(events);
    const icsContent = generateICalendar(normalizedEvents);
    
    // For Vercel deployment: Stream content directly instead of saving to disk
    // Generate a unique identifier for this session
    const sessionId = Date.now().toString();
    
    // Store the content temporarily in memory (for this request only)
    const calendarData = {
      content: icsContent,
      eventCount: normalizedEvents.length,
      timestamp: sessionId,
      cityName: cityName || 'Unknown'
    };
    
    // Store in global memory for immediate download (Vercel-compatible)
    global.calendarStore = global.calendarStore || {};
    global.calendarStore[sessionId] = calendarData;
    
    // Clean up old entries (keep only last 10 minutes of data)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    Object.keys(global.calendarStore).forEach(key => {
      if (parseInt(key) < tenMinutesAgo) {
        delete global.calendarStore[key];
      }
    });
    
    res.json({
      success: true,
      downloadUrl: `/api/download/${sessionId}`,
      eventCount: normalizedEvents.length,
      message: `Calendar generated successfully${useGeneratedEvents ? ' with location-specific events' : ''}`,
      events: normalizedEvents, // Include events data for frontend display
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Error generating calendar:', error.message);
    
    res.status(500).json({ 
      error: 'Failed to generate calendar',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/download/{sessionId}:
 *   get:
 *     summary: Download calendar file by session ID
 *     description: Downloads the iCalendar (.ics) file for a specific session. Files are available for 10 minutes after generation.
 *     tags: [Download]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session identifier from the generate-calendar response
 *         example: "1703123456789"
 *     responses:
 *       200:
 *         description: iCalendar file download
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *               example: |
 *                 BEGIN:VCALENDAR
 *                 VERSION:2.0
 *                 PRODID:-//your-ical//Calendar Generator//EN
 *                 BEGIN:VEVENT
 *                 UID:event-123
 *                 DTSTART:20231201T100000Z
 *                 DTEND:20231201T120000Z
 *                 SUMMARY:Sample Event
 *                 END:VEVENT
 *                 END:VCALENDAR
 *       404:
 *         description: Calendar session not found or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Calendar session not found or expired"
 */
app.get('/api/download/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if session exists in memory
    if (!global.calendarStore || !global.calendarStore[sessionId]) {
      return res.status(404).json({ 
        error: 'Calendar session not found or expired. Please generate a new calendar.' 
      });
    }
    
    const calendarData = global.calendarStore[sessionId];
    const filename = `${calendarData.cityName.replace(/[^a-zA-Z0-9]/g, '-')}-events-${sessionId}.ics`;
    
    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the calendar content directly
    res.send(calendarData.content);
    
    // Clean up this session after successful download
    setTimeout(() => {
      if (global.calendarStore && global.calendarStore[sessionId]) {
        delete global.calendarStore[sessionId];
      }
    }, 1000); // Delete after 1 second
    
  } catch (error) {
    console.error('Error downloading calendar:', error.message);
    res.status(500).json({ 
      error: 'Failed to download calendar',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get available event categories
 *     description: Returns a list of all available event categories that can be used when generating calendars
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of available categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *             example:
 *               - value: "public-holidays"
 *                 label: "Public Holidays"
 *               - value: "concerts"
 *                 label: "Concerts"
 *               - value: "festivals"
 *                 label: "Festivals"
 */
app.get('/api/categories', (req, res) => {
  const categories = [
    { value: 'public-holidays', label: 'Public Holidays' },
    { value: 'observances', label: 'Observances' },
    { value: 'academic', label: 'Academic Events' },
    { value: 'conferences', label: 'Conferences' },
    { value: 'concerts', label: 'Concerts' },
    { value: 'festivals', label: 'Festivals' },
    { value: 'performing-arts', label: 'Performing Arts' },
    { value: 'sports', label: 'Sports' },
    { value: 'community', label: 'Community Events' },
    { value: 'daylight-savings', label: 'Daylight Savings' },
    { value: 'politics', label: 'Politics' },
    { value: 'health-warnings', label: 'Health Warnings' },
    { value: 'severe-weather', label: 'Severe Weather' }
  ];
  
  res.json(categories);
});

/**
 * @swagger
 * /events-{timestamp}.ics:
 *   get:
 *     summary: Download generated calendar file
 *     description: Downloads the iCalendar (.ics) file that was generated by the generate-calendar endpoint
 *     tags: [Download]
 *     parameters:
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: string
 *         description: Timestamp identifier from the generate-calendar response
 *         example: "1755429430542"
 *     responses:
 *       200:
 *         description: iCalendar file download
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *               example: |
 *                 BEGIN:VCALENDAR
 *                 VERSION:2.0
 *                 PRODID:-//sebbo.net//ical-generator//EN
 *                 NAME:PredictHQ Events
 *                 BEGIN:VEVENT
 *                 UID:event-123
 *                 SUMMARY:Berlin Music Festival
 *                 DTSTART:20250817T090000
 *                 DTEND:20250817T100000
 *                 END:VEVENT
 *                 END:VCALENDAR
 *       404:
 *         description: Calendar file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /events.ics:
 *   get:
 *     summary: Download legacy calendar file
 *     description: Downloads the legacy iCalendar file (deprecated - use the web interface instead)
 *     tags: [Download]
 *     deprecated: true
 *     responses:
 *       200:
 *         description: Legacy iCalendar file
 *         content:
 *           text/calendar:
 *             schema:
 *               type: string
 *       404:
 *         description: Calendar file not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/events.ics', (req, res) => {
  const icsPath = path.join(__dirname, 'public', 'events.ics');
  
  if (!fs.existsSync(icsPath)) {
    return res.status(404).json({ 
      error: 'Calendar file not found. Use the web interface to generate a calendar.' 
    });
  }

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="events.ics"');
  res.sendFile(icsPath);
});

// Serve Vue.js app (catch-all route)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'Calendar Generator API',
      endpoints: {
        generateCalendar: 'POST /api/generate-calendar',
        categories: 'GET /api/categories',
        legacyCalendar: 'GET /events.ics'
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Calendar server running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs/`);
});