/**
 * Main Application Entry Point
 * 
 * This file bootstraps the Vue.js application and mounts it to the DOM.
 * It configures the root component and imports the global styles.
 * 
 * Technical Stack:
 * - Vue 3 with TypeScript for type safety and modern reactivity
 * - Tailwind CSS for utility-first styling
 * - Composition API for better code organization
 * 
 * The application is mounted to the #app element in index.html
 */

import { createApp } from 'vue'
import App from './App.vue'
import './style.css'  // Import Tailwind CSS and custom styles

// Create and mount the Vue application
// This creates the root component and attaches it to the DOM element with id="app"
createApp(App).mount('#app')