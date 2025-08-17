const ical = require('ical-generator').default;
const fs = require('fs');
const path = require('path');

function normalizeEvents(predictHQEvents) {
  return predictHQEvents.map(event => ({
    title: event.title || event.name || 'Event',
    startDate: new Date(event.start || event.start_local || event.date),
    endDate: new Date(event.end || event.end_local || event.date)
  }));
}

function generateICalendar(events) {
  const calendar = ical({
    name: 'PredictHQ Events',
    description: 'Events fetched from PredictHQ API',
    timezone: 'Europe/Berlin'
  });

  // Create a better distribution: 5 events per day for 4 weeks
  const today = new Date();
  const maxEventsPerDay = 5;
  const daysToFill = 28; // 4 weeks
  
  // Helper function to generate random time
  function getRandomTime(date) {
    const hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 9 PM
    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45 minutes
    const newDate = new Date(date);
    newDate.setHours(hour, minute, 0, 0);
    return newDate;
  }
  
  // Helper function to get random duration
  function getRandomDuration() {
    const durations = [60, 90, 120, 180]; // 1, 1.5, 2, or 3 hours in minutes
    return durations[Math.floor(Math.random() * durations.length)];
  }
  
  // Group events by days and limit to 5 per day
  const distributedEvents = [];
  let eventIndex = 0;
  
  for (let dayOffset = 0; dayOffset < daysToFill && eventIndex < events.length; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    
    let eventsForDay = 0;
    
    while (eventsForDay < maxEventsPerDay && eventIndex < events.length) {
      const event = events[eventIndex];
      
      // Generate random start time and duration (overlaps allowed)
      const eventStart = getRandomTime(currentDate);
      const duration = getRandomDuration();
      const eventEnd = new Date(eventStart.getTime() + duration * 60000);
      
      const newEvent = {
        ...event,
        startDate: eventStart,
        endDate: eventEnd
      };
      
      distributedEvents.push(newEvent);
      eventIndex++;
      eventsForDay++;
    }
  }

  console.log(`Creating calendar with ${distributedEvents.length} events distributed over ${daysToFill} days`);

  distributedEvents.forEach((event, index) => {
    calendar.createEvent({
      start: event.startDate,
      end: event.endDate,
      summary: event.title,
      description: `Event from PredictHQ`,
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