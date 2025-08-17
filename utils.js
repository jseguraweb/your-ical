const ical = require('ical-generator').default;
const fs = require('fs');
const path = require('path');

function normalizeEvents(predictHQEvents) {
  return predictHQEvents.map(event => {
    // Use start_local and end_local for proper timezone handling
    // These fields contain the event time in the local timezone
    const startDate = new Date(event.start_local || event.start || event.date);
    const endDate = new Date(event.end_local || event.end || event.date);
    
    return {
      title: event.title || event.name || 'Event',
      startDate: startDate,
      endDate: endDate,
      location: event.geo?.address?.formatted_address || 
                (event.geo?.address?.locality ? `${event.geo.address.locality}, Germany` : 'Germany'),
      description: event.description || 
                   (event.phq_labels ? event.phq_labels.map(label => label.label).join(', ') : 'Event')
    };
  });
}

function generateICalendar(events) {
  const calendar = ical({
    name: 'PredictHQ Events',
    description: 'Events fetched from PredictHQ API',
    timezone: 'Europe/Berlin'
  });

  // Use the actual event times from the API instead of generating random ones
  console.log(`Creating calendar with ${events.length} events using their actual times`);

  events.forEach((event, index) => {
    calendar.createEvent({
      start: event.startDate,
      end: event.endDate,
      summary: event.title,
      description: event.description || `Event from PredictHQ`,
      location: event.location || '',
      uid: `predicthq-${Date.now()}-${index}`
    });
  });

  return calendar.toString();
}

function saveICalendarFile(icsContent) {
  const publicDir = path.join(__dirname, 'public');
  const filePath = path.join(publicDir, 'events.ics');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, icsContent, 'utf8');
  console.log(`iCalendar file saved to: ${filePath}`);
}

module.exports = {
  normalizeEvents,
  generateICalendar,
  saveICalendarFile
};