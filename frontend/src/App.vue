<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="mb-8">
            <Logo />
          </div>
          <h1 class="text-5xl font-bold text-green-900 mb-4 tracking-tight">
            Calendar Event Generator
          </h1>
          <p class="text-xl text-green-700 max-w-2xl mx-auto leading-relaxed">
            Generate personalized event calendars for any location and interests with our intelligent event discovery platform
          </p>
        </div>

        <!-- Main Form -->
        <CalendarForm @calendar-generated="onCalendarGenerated" />

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-8 p-6 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-800 rounded-2xl shadow-lg">
          <div class="flex items-center mb-4">
            <div class="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-lg mr-3">
              <i class="fas fa-check text-white text-sm"></i>
            </div>
            <span class="font-medium text-lg">{{ successMessage }}</span>
          </div>
          <a
            :href="downloadUrl"
            download
            class="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <i class="fas fa-download mr-2"></i>
            Download Calendar
          </a>
        </div>

        <!-- Info Section -->
        <div class="mt-12 bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl p-8 shadow-lg">
          <h3 class="text-2xl font-bold text-green-900 mb-6 flex items-center">
            <div class="inline-flex items-center justify-center w-8 h-8 bg-green-500 rounded-lg mr-3">
              <i class="fas fa-info text-white text-sm"></i>
            </div>
            How it works
          </h3>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 rounded-xl mr-4 mt-1 font-bold text-lg">
                  1
                </div>
                <div>
                  <h4 class="font-semibold text-green-900 mb-2 text-lg">Search Location</h4>
                  <p class="text-green-700">Find your city using our intelligent location search powered by OpenStreetMap</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 rounded-xl mr-4 mt-1 font-bold text-lg">
                  2
                </div>
                <div>
                  <h4 class="font-semibold text-green-900 mb-2 text-lg">Choose Categories</h4>
                  <p class="text-green-700">Select the types of events you're interested in from our comprehensive list</p>
                </div>
              </div>
            </div>
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 rounded-xl mr-4 mt-1 font-bold text-lg">
                  3
                </div>
                <div>
                  <h4 class="font-semibold text-green-900 mb-2 text-lg">Set Duration</h4>
                  <p class="text-green-700">Choose how many weeks of events you want in your calendar</p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 rounded-xl mr-4 mt-1 font-bold text-lg">
                  4
                </div>
                <div>
                  <h4 class="font-semibold text-green-900 mb-2 text-lg">Download & Import</h4>
                  <p class="text-green-700">Import the .ics file into your favorite calendar app like Google Calendar or Outlook</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * App Component - Main Application Root
 * 
 * The main application component that serves as the landing page for "your iCal".
 * This component orchestrates the overall user experience for calendar generation.
 * 
 * Architecture:
 * - Uses Vue 3 Composition API with TypeScript for type safety
 * - Implements a green-themed design using Tailwind CSS
 * - Features a responsive layout with modern glass morphism effects
 * - Handles calendar generation success states and download links
 * 
 * Key Features:
 * - Professional branding with custom SVG logo
 * - Step-by-step "How it works" explanation
 * - Success message display with download functionality
 * - Fully responsive design for all device sizes
 * - Accessibility considerations throughout
 * 
 * Component Structure:
 * 1. Header with logo and hero text
 * 2. CalendarForm for user input and calendar generation
 * 3. Success message with download link (conditional)
 * 4. Informational "How it works" section
 */

import { ref, type Ref } from 'vue'
import CalendarForm from './components/CalendarForm.vue'
import Logo from './components/Logo.vue'

// TypeScript interface for calendar generation response
interface CalendarResponse {
  success: boolean      // Operation success status
  eventCount?: number   // Number of events in generated calendar
  downloadUrl?: string  // URL for downloading the .ics file
  error?: string       // Error message if generation failed
}

// Reactive state for success messaging and download functionality
const successMessage: Ref<string> = ref('')  // Display message when calendar is generated
const downloadUrl: Ref<string> = ref('')     // URL for the generated calendar file

/**
 * Handles successful calendar generation from the CalendarForm component
 * Updates the UI to show success message and provide download link
 * 
 * @param data - Response data from the calendar generation API
 */
const onCalendarGenerated = (data: CalendarResponse): void => {
  // Show success message with event count if available
  if (data.eventCount) {
    successMessage.value = `Calendar generated with ${data.eventCount} events!`
  }
  
  // Set download URL for the generated .ics file
  if (data.downloadUrl) {
    downloadUrl.value = data.downloadUrl
  }
}
</script>