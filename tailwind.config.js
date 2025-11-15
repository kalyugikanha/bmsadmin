/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'], // Sets Lato as the default sans-serif font
      },
      colors: {
        staymaster: {
          primary: '#008080', // Main brand teal color
          'light-bg': '#F8F9FA', // Background color for the main content area
          'white-bg': '#FFFFFF', // White backgrounds for cards, sidebar, header
          'border-light': '#E5E7EB', // Light border color
          'text-dark': '#1F2937', // Darker text for headings
          'text-gray': '#6B7280', // General gray text
          'text-sidebar-inactive': '#4B5563', // Sidebar menu item text (inactive)
          'green-status-bg': '#D1FAE5', // Background for "Confirmed" status badge
          'green-status-text': '#065F46', // Text color for "Confirmed" status badge
          'filter-button-bg': '#F9FAFB', // Background for the filter button
          'filter-button-border': '#D1D5DB', // Border for the filter button
          'search-border': '#D1D5DB', // Border for the search input
          'search-placeholder': '#9CA3AF', // Placeholder text color for search
          'table-header-bg': '#F9FAFB', // Table header background
          'table-header-text': '#6B7280', // Table header text
        },
      },
    },
  },
  plugins: [],
}