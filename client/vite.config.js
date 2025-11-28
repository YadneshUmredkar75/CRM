import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Important for deployment (fixes MIME & vite.svg issue)
  base: './',  

  server: {
    proxy: { 
        target: 'https://crm-c1y4.onrender.com',
        changeOrigin: true,
        secure: false,
    
    },
  },
})
// VITE_API_URL=https://crm-backend.onrender.com
