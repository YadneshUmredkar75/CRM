// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
  
//   // Important for deployment (fixes MIME & vite.svg issue)
//   base: './',  

//   server: {
//     proxy: { 
//         target: 'https://crm-c1y4.onrender.com',
//         changeOrigin: true,
//         secure: false,
    
//     },
//   },
// })
// // VITE_API_URL=https://crm-backend.onrender.com
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // frontend dev proxy → backend on Render
  server: {
    proxy: {
      "/api": {
        target: "https://crm-c1y4.onrender.com", // your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Important for fixing MIME errors on production hosting
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },

  // Important when deploying to cPanel / Render static hosting
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});