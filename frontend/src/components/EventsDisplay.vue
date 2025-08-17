<!--
  EventsDisplay Component
  
  Displays generated calendar events in an organized way with:
  - Day-based accordion grouping
  - Event cards with time, title, and download option
  - Download ICS functionality
  - Responsive design with Tailwind CSS
-->

<template>
  <div class="w-full max-w-4xl mx-auto p-6">
    <!-- Header with download button -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Generated Events</h2>
        <p class="text-sm text-gray-600 mt-1">{{ eventCount }} events found</p>
      </div>
      
      <button
        @click="downloadICS"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-download mr-2"></i>
        Download .ics
      </button>
    </div>

    <!-- Events grouped by day -->
    <div class="space-y-4">
      <div
        v-for="(dayData, date) in groupedEvents"
        :key="date"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <!-- Day header (accordion trigger) -->
        <button
          @click="toggleDay(date)"
          class="w-full px-6 py-4 bg-gray-50 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <div>
            <h3 class="font-semibold text-gray-900">{{ formatDate(date) }}</h3>
            <p class="text-sm text-gray-600">{{ dayData.events.length }} events</p>
          </div>
          <i
            class="fas fa-chevron-down transition-transform duration-200"
            :class="{ 'rotate-180': openDays.has(date) }"
          ></i>
        </button>

        <!-- Day events (collapsible) -->
        <div
          v-show="openDays.has(date)"
          class="bg-white"
        >
          <div class="divide-y divide-gray-100">
            <div
              v-for="event in dayData.events"
              :key="event.id || event.title"
              class="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Event time -->
                  <div class="text-sm text-blue-600 font-medium mb-1">
                    {{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}
                  </div>
                  
                  <!-- Event title -->
                  <h4 class="font-semibold text-gray-900 mb-2">{{ event.title }}</h4>
                  
                  <!-- Event details -->
                  <div class="text-sm text-gray-600 space-y-1">
                    <div v-if="event.location" class="flex items-center">
                      <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>
                      {{ event.location }}
                    </div>
                    <div v-if="event.description" class="flex items-start">
                      <i class="fas fa-info-circle mr-2 text-gray-400 mt-0.5"></i>
                      <span>{{ event.description }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Event duration badge -->
                <div class="ml-4 flex-shrink-0">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ getEventDuration(event) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!events || events.length === 0"
      class="text-center py-12"
    >
      <i class="fas fa-calendar-times text-4xl text-gray-400 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No events found</h3>
      <p class="text-gray-600">Try adjusting your search criteria or location.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Component Props
 */
interface Event {
  title: string
  startDate: string | Date
  endDate: string | Date
  location?: string
  description?: string
}

interface Props {
  events: Event[]
  downloadUrl?: string
  eventCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  eventCount: 0
})

/**
 * Reactive State
 */
const openDays = ref(new Set<string>())

/**
 * Computed Properties
 */
const groupedEvents = computed(() => {
  const groups: Record<string, { events: Event[]; date: Date }> = {}
  
  props.events.forEach(event => {
    const eventDate = new Date(event.startDate)
    const dateKey = eventDate.toISOString().split('T')[0] // YYYY-MM-DD
    
    if (!groups[dateKey]) {
      groups[dateKey] = {
        events: [],
        date: eventDate
      }
    }
    
    groups[dateKey].events.push(event)
  })
  
  // Sort events within each day by start time
  Object.values(groups).forEach(group => {
    group.events.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
  })
  
  return groups
})

/**
 * Methods
 */
const toggleDay = (date: string) => {
  if (openDays.value.has(date)) {
    openDays.value.delete(date)
  } else {
    openDays.value.add(date)
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  // Check if it's today or tomorrow
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }
}

const formatTime = (dateTime: string | Date): string => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

const getEventDuration = (event: Event): string => {
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  const durationMs = end.getTime() - start.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours === 0) {
    return `${minutes}m`
  } else if (minutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${minutes}m`
  }
}

const downloadICS = () => {
  if (props.downloadUrl) {
    window.open(props.downloadUrl, '_blank')
  }
}

// Open first day by default if events exist
if (Object.keys(groupedEvents.value).length > 0) {
  const firstDate = Object.keys(groupedEvents.value).sort()[0]
  openDays.value.add(firstDate)
}
</script>

<style scoped>
/* Custom styles for smooth accordion animation */
.rotate-180 {
  transform: rotate(180deg);
}
</style>