import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- YEH NAYA HISSA JODEIN ---
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Hamara backend server
        changeOrigin: true,
      }
    }
  },
  // -----------------------------
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  // Fix for MIME type issues in deployment
  base: '/',
  // Ensure proper MIME types for JS modules
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})
