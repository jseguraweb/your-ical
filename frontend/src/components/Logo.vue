<template>
  <!-- 
    Logo Component - Brand identity for "your iCal" 
    Features a custom SVG design with:
    - Circular gradient background in green theme
    - Calendar icon with realistic binding rings
    - Typography with "your" and "iCal" text
    - Decorative elements for visual appeal
    - No hover effects as this is a static landing page element
  -->
  <div class="flex items-center justify-center">
    <svg 
      width="140" 
      height="50" 
      viewBox="0 0 140 50" 
      xmlns="http://www.w3.org/2000/svg"
      class="select-none"
      role="img"
      aria-label="your iCal logo"
    >
      <!-- Main background circle with green gradient -->
      <circle 
        cx="25" 
        cy="25" 
        r="20" 
        fill="url(#bgGradient)" 
        class="drop-shadow-lg"
      />
      
      <!-- White calendar body -->
      <rect 
        x="16" 
        y="18" 
        width="18" 
        height="14" 
        rx="2" 
        fill="white" 
        opacity="0.95"
      />
      
      <!-- Calendar spiral binding rings at the top -->
      <rect x="19" y="14" width="1.5" height="8" rx="0.75" fill="#15803d" />
      <rect x="23" y="14" width="1.5" height="8" rx="0.75" fill="#15803d" />
      <rect x="27" y="14" width="1.5" height="8" rx="0.75" fill="#15803d" />
      <rect x="31" y="14" width="1.5" height="8" rx="0.75" fill="#15803d" />
      
      <!-- Horizontal line separating header from calendar grid -->
      <line x1="18" y1="23" x2="32" y2="23" stroke="#22c55e" stroke-width="1" />
      
      <!-- Calendar event dots representing scheduled events -->
      <circle cx="20" cy="26" r="1" fill="#16a34a" />
      <circle cx="24" cy="26" r="1" fill="#22c55e" />
      <circle cx="28" cy="26" r="1" fill="#16a34a" />
      <circle cx="20" cy="29" r="1" fill="#22c55e" />
      <circle cx="28" cy="29" r="1" fill="#16a34a" />
      
      <!-- Brand text "your" in smaller, lighter green -->
      <text 
        x="55" 
        y="20" 
        font-family="Inter, system-ui, sans-serif" 
        font-size="14" 
        font-weight="500" 
        fill="#166534"
        letter-spacing="-0.01em"
      >
        your
      </text>
      
      <!-- Brand text "iCal" in larger, bold with gradient -->
      <text 
        x="55" 
        y="35" 
        font-family="Inter, system-ui, sans-serif" 
        font-size="20" 
        font-weight="800" 
        fill="url(#textGradient)"
        letter-spacing="-0.02em"
      >
        iCal
      </text>
      
      <!-- Decorative floating circles for visual balance -->
      <circle cx="112" cy="15" r="1.5" fill="#22c55e" opacity="0.6" />
      <circle cx="118" cy="22" r="1" fill="#16a34a" opacity="0.4" />
      <circle cx="124" cy="28" r="1.5" fill="#22c55e" opacity="0.5" />
      
      <!-- SVG gradient definitions for reusable styling -->
      <defs>
        <!-- Background gradient from light to dark green -->
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
        </linearGradient>
        <!-- Text gradient for the "iCal" text -->
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#15803d;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#166534;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
/**
 * Logo Component
 * 
 * A static SVG logo component for the "your iCal" brand.
 * This component is purely presentational and contains no interactive logic.
 * 
 * Features:
 * - Custom SVG artwork representing a calendar
 * - Green color scheme matching the app theme
 * - Professional typography with Inter font
 * - Accessibility attributes for screen readers
 * 
 * Usage: Used in the main App header as the primary brand element
 */

// No reactive state or methods needed - this is a purely static component
</script>