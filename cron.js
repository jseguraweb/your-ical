const fs = require('fs');
const path = require('path');

// Load .env file manually
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

const axios = require('axios');
const cron = require('node-cron');
const { normalizeEvents, generateICalendar, saveICalendarFile } = require('./utils');

const PREDICTHQ_API_URL = 'https://api.predicthq.com/v1/events/';
const PREDICTHQ_TOKEN = process.env.PREDICTHQ_TOKEN;

async function fetchPredictHQEvents() {
  try {
    const headers = PREDICTHQ_TOKEN ? {
      'Authorization': `Bearer ${PREDICTHQ_TOKEN}`
    } : {};

    console.log('Fetching events from PredictHQ for Berlin, Germany...');
    console.log('Date range:', new Date().toISOString().split('T')[0], 'to', new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    const params = {
      limit: 140,  // 5 events per day × 28 days = 140 events max
      category: 'public-holidays,observances,academic,conferences,concerts,festivals,performing-arts,sports',
      'start.gte': new Date().toISOString().split('T')[0],
      'start.lte': new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'location.within': '50km@52.5200,13.4050'  // Berlin coordinates with 50km radius
    };
    
    console.log('API parameters:', params);
    
    const response = await axios.get(PREDICTHQ_API_URL, {
      headers,
      params
    });

    const events = response.data.results || [];
    console.log(`Fetched ${events.length} events from PredictHQ`);

    const normalizedEvents = normalizeEvents(events);
    const icsContent = generateICalendar(normalizedEvents);
    saveICalendarFile(icsContent);
    
    console.log('Calendar generation completed successfully');
    
  } catch (error) {
    console.error('Error fetching events:', error.message);
    
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please set PREDICTHQ_TOKEN environment variable.');
      console.error('Get your token from: https://control.predicthq.com/');
    }
    
    const fallbackEvents = [
      {
        title: 'Sample Event',
        startDate: new Date(),
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    ];
    
    console.log('Creating fallback calendar with sample event...');
    const icsContent = generateICalendar(fallbackEvents);
    saveICalendarFile(icsContent);
  }
}

function startCronJob() {
  console.log('Starting daily cron job (06:00)...');
  
  cron.schedule('0 6 * * *', () => {
    console.log('Running scheduled calendar update...');
    fetchPredictHQEvents();
  });
  
  console.log('Cron job scheduled. Running initial fetch...');
  fetchPredictHQEvents();
}

if (require.main === module) {
  fetchPredictHQEvents();
} else {
  module.exports = { fetchPredictHQEvents, startCronJob };
}