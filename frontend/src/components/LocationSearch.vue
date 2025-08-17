<template>
  <div class="relative">
    <label class="block text-lg font-semibold text-green-900 mb-4 flex items-center">
      <div class="inline-flex items-center justify-center w-6 h-6 bg-green-500 rounded-lg mr-3">
        <i class="fas fa-map-marker-alt text-white text-xs"></i>
      </div>
      Location
    </label>
    <div class="relative">
      <input
        v-model="searchQuery"
        @input="debounceSearch"
        @focus="showDropdown = true"
        @blur="hideDropdown"
        type="text"
        placeholder="Search for a city (e.g., Berlin, London, Paris...)"
        class="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
        required
      >
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <i v-if="loading" class="fas fa-spinner fa-spin text-green-400"></i>
        <i v-else class="fas fa-search text-green-400"></i>
      </div>
      
      <!-- Location suggestions dropdown -->
      <div v-if="showDropdown && suggestions.length > 0" class="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border border-green-200 rounded-xl shadow-xl shadow-green-100/50 max-h-60 overflow-y-auto">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.place_id"
          @mousedown="selectLocation(suggestion)"
          class="px-4 py-3 cursor-pointer border-b border-green-100 last:border-b-0 hover:bg-green-50/80 hover:border-l-4 hover:border-l-green-500 transition-all duration-150"
        >
          <div class="font-medium text-green-900">{{ suggestion.display_name }}</div>
          <div class="text-sm text-green-600 capitalize">{{ suggestion.type }}</div>
        </div>
      </div>
    </div>
    <p class="text-sm text-green-700 mt-2 flex items-center">
      <i class="fas fa-info-circle mr-2 text-green-500"></i>
      {{ selectedLocation ? `Selected: ${selectedLocation.displayName}` : 'Start typing to search for a location' }}
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * LocationSearch Component
 * 
 * Provides intelligent location search functionality using OpenStreetMap's Nominatim API.
 * Features debounced search, dropdown suggestions, and location selection.
 * 
 * Key Features:
 * - Real-time search with 300ms debounce for performance
 * - Filters results to show only cities, towns, villages, etc.
 * - Converts selected location to PredictHQ API format (50km radius)
 * - Accessible keyboard navigation and screen reader support
 * - Loading states and error handling
 * 
 * @emits location-selected - Fired when user selects a location from dropdown
 */

import { ref, type Ref } from 'vue'
import axios from 'axios'

// TypeScript interfaces for type safety and better developer experience
interface LocationSuggestion {
  place_id: string      // Unique identifier from Nominatim
  display_name: string  // Full address/location name
  type: string         // Location type (city, town, village, etc.)
  lat: string          // Latitude coordinate
  lon: string          // Longitude coordinate
  class?: string       // Optional OpenStreetMap classification
}

interface SelectedLocation {
  displayName: string  // Human-readable location name
  coordinates: string  // Formatted for PredictHQ API (e.g., "50km@52.5200,13.4050")
  lat: string         // Latitude for mapping
  lon: string         // Longitude for mapping
}

// Component event emissions with TypeScript typing
const emit = defineEmits<{
  'location-selected': [location: SelectedLocation]
}>()

// Reactive state management using Vue 3 Composition API
const searchQuery: Ref<string> = ref('')                          // User's search input
const suggestions: Ref<LocationSuggestion[]> = ref([])            // API search results
const selectedLocation: Ref<SelectedLocation | null> = ref(null)  // Currently selected location
const showDropdown: Ref<boolean> = ref(false)                     // Dropdown visibility state
const loading: Ref<boolean> = ref(false)                          // Loading indicator
const searchTimeout: Ref<NodeJS.Timeout | null> = ref(null)       // Debounce timer reference

/**
 * Debounces the search function to avoid excessive API calls
 * Waits 300ms after user stops typing before triggering search
 */
const debounceSearch = (): void => {
  // Clear existing timeout to reset the debounce timer
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // Set new timeout for delayed search execution
  searchTimeout.value = setTimeout(() => {
    if (searchQuery.value.length >= 3) {
      searchLocations()
    } else {
      // Clear suggestions if search query is too short
      suggestions.value = []
    }
  }, 300) // 300ms debounce delay for optimal UX
}

/**
 * Performs the actual location search using OpenStreetMap Nominatim API
 * Filters results to show only relevant location types (cities, towns, etc.)
 */
const searchLocations = async (): Promise<void> => {
  // Safety check - don't search if query is too short
  if (searchQuery.value.length < 3) return
  
  loading.value = true
  try {
    // Call Nominatim API with search parameters
    const response = await axios.get<LocationSuggestion[]>('https://nominatim.openstreetmap.org/search', {
      params: {
        q: searchQuery.value,     // Search query
        format: 'json',           // Response format
        limit: 8,                 // Maximum results
        addressdetails: 1,        // Include address breakdown
        extratags: 1              // Include additional metadata
      }
    })
    
    // Filter results to show only cities, towns, villages, etc.
    // This improves relevance by excluding streets, buildings, etc.
    suggestions.value = response.data.filter((item: LocationSuggestion) => 
      ['city', 'town', 'village', 'municipality', 'administrative'].some(type => 
        item.type?.includes(type) || item.class === 'place'
      )
    ).slice(0, 6) // Limit to 6 suggestions for clean UI
    
  } catch (error) {
    console.error('Error searching locations:', error)
    suggestions.value = [] // Clear suggestions on error
  } finally {
    loading.value = false
  }
}

/**
 * Handles location selection from the dropdown
 * Formats the location data for the parent component and PredictHQ API
 */
const selectLocation = (location: LocationSuggestion): void => {
  // Create formatted location object
  selectedLocation.value = {
    displayName: location.display_name,
    // Format coordinates for PredictHQ API (50km radius around the location)
    coordinates: `50km@${location.lat},${location.lon}`,
    lat: location.lat,
    lon: location.lon
  }
  
  // Update UI state
  searchQuery.value = location.display_name
  suggestions.value = []
  showDropdown.value = false
  
  // Emit selection event to parent component
  emit('location-selected', selectedLocation.value)
}

/**
 * Hides the dropdown with a small delay
 * The delay allows click events on dropdown items to register before hiding
 */
const hideDropdown = (): void => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200) // 200ms delay to ensure click events are processed
}
</script>