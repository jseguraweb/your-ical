<template>
  <div class="bg-white/90 backdrop-blur-sm border border-green-200/50 shadow-xl shadow-green-100/50 rounded-2xl p-8">
    <form @submit.prevent="generateCalendar" class="space-y-8">
      <!-- Location Search -->
      <LocationSearch @location-selected="onLocationSelected" />

      <!-- Event Categories -->
      <div>
        <label class="block text-lg font-semibold text-green-900 mb-4 flex items-center">
          <div class="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-lg mr-3">
            <i class="fas fa-tags text-white text-xs"></i>
          </div>
          Event Categories
        </label>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <label
            v-for="category in availableCategories"
            :key="category.value"
            class="flex items-center p-3 border border-green-200 rounded-xl cursor-pointer transition-all duration-200 hover:bg-green-50/80 hover:transform hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-100"
            :class="{ 'bg-green-100 border-green-300 text-green-700': selectedCategories.includes(category.value) }"
          >
            <input
              type="checkbox"
              :value="category.value"
              v-model="selectedCategories"
              class="sr-only"
            >
            <span class="text-sm font-medium">{{ category.label }}</span>
          </label>
        </div>
      </div>

      <!-- Duration -->
      <div>
        <label class="block text-lg font-semibold text-green-900 mb-4 flex items-center">
          <div class="inline-flex items-center justify-center w-6 h-6 bg-emerald-600 rounded-lg mr-3">
            <i class="fas fa-clock text-white text-xs"></i>
          </div>
          Duration
        </label>
        <select
          v-model="weeks"
          class="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
        >
          <option value="1">1 week</option>
          <option value="2">2 weeks</option>
          <option value="4" selected>4 weeks</option>
          <option value="8">8 weeks</option>
          <option value="12">12 weeks</option>
        </select>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || !selectedLocation || selectedCategories.length === 0"
        class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin mr-3"></i>
        <i v-else class="fas fa-calendar-plus mr-3"></i>
        {{ loading ? 'Generating Calendar...' : 'Generate Calendar' }}
      </button>
    </form>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
      <div class="flex items-center">
        <div class="inline-flex items-center justify-center w-6 h-6 bg-red-500 rounded-lg mr-3">
          <i class="fas fa-exclamation-triangle text-white text-xs"></i>
        </div>
        <span class="font-medium">{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CalendarForm Component
 * 
 * Main form component that orchestrates the calendar generation process.
 * Combines location search, category selection, and duration settings to
 * generate personalized event calendars via the backend API.
 * 
 * Key Features:
 * - Location selection using the LocationSearch component
 * - Multi-select category checkboxes with visual feedback
 * - Duration selection (1-12 weeks)
 * - Form validation and loading states
 * - Error handling with user-friendly messages
 * - Responsive design with Tailwind CSS
 * 
 * @emits calendar-generated - Fired when calendar is successfully created
 */

import { ref, onMounted, type Ref } from 'vue'
import axios from 'axios'
import LocationSearch from './LocationSearch.vue'

// TypeScript interfaces for strong typing and better maintainability
interface Category {
  value: string  // API identifier (e.g., 'public-holidays')
  label: string  // Human-readable name (e.g., 'Public Holidays')
}

interface SelectedLocation {
  displayName: string  // Full location name for display
  coordinates: string  // Formatted for PredictHQ API
  lat: string         // Latitude coordinate
  lon: string         // Longitude coordinate
}

interface CalendarResponse {
  success: boolean      // Whether the operation succeeded
  eventCount?: number   // Number of events generated (optional)
  downloadUrl?: string  // URL to download the .ics file (optional)
  error?: string       // Error message if operation failed (optional)
}

// Component event emissions with TypeScript typing
const emit = defineEmits<{
  'calendar-generated': [data: CalendarResponse]
}>()

// Reactive state management using Vue 3 Composition API
const selectedLocation: Ref<SelectedLocation | null> = ref(null)                    // User's chosen location
const selectedCategories: Ref<string[]> = ref(['public-holidays', 'festivals', 'concerts'])  // Default event categories
const weeks: Ref<number> = ref(4)                                                  // Calendar duration in weeks
const availableCategories: Ref<Category[]> = ref([])                               // Categories loaded from API
const loading: Ref<boolean> = ref(false)                                          // Form submission state
const errorMessage: Ref<string> = ref('')                                         // Error display

// Component lifecycle hook - runs when component is mounted
onMounted(async () => {
  // Load available event categories from the backend
  await loadCategories()
})

/**
 * Loads available event categories from the backend API
 * This populates the category selection checkboxes
 */
const loadCategories = async (): Promise<void> => {
  try {
    const response = await axios.get<Category[]>('/api/categories')
    availableCategories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
    // Graceful degradation - form still works but categories might be empty
  }
}

/**
 * Handles location selection from the LocationSearch component
 * Clears any previous error messages when a new location is selected
 */
const onLocationSelected = (location: SelectedLocation): void => {
  selectedLocation.value = location
  errorMessage.value = '' // Clear errors when location changes
}

/**
 * Main calendar generation function
 * Validates form, calls backend API, and handles the response
 */
const generateCalendar = async (): Promise<void> => {
  // Validation - ensure location is selected
  if (!selectedLocation.value) return
  
  // Set loading state and clear previous errors
  loading.value = true
  errorMessage.value = ''

  try {
    // Call backend API to generate calendar
    const response = await axios.post<CalendarResponse>('/api/generate-calendar', {
      location: selectedLocation.value.coordinates,              // PredictHQ format coordinates
      categories: selectedCategories.value.join(','),            // Comma-separated category list
      weeks: weeks.value,                                        // Duration in weeks
      cityName: selectedLocation.value.displayName.split(',')[0] // Extract just the city name
    })

    if (response.data.success) {
      // Success - emit event to parent component (App.vue)
      emit('calendar-generated', response.data)
    } else {
      // Backend returned an error
      errorMessage.value = response.data.error || 'Failed to generate calendar'
    }
  } catch (error: any) {
    // Handle network errors and API errors
    if (error.response?.data?.error) {
      // Server returned a specific error message
      errorMessage.value = error.response.data.error
    } else {
      // Generic network/connection error
      errorMessage.value = 'Network error. Please try again.'
    }
    console.error('Error generating calendar:', error)
  } finally {
    // Always clear loading state when done
    loading.value = false
  }
}
</script>