import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20000,
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//,
              priority: 30,
            },
            {
              name: 'supabase-vendor',
              test: /node_modules\/@supabase\//,
              priority: 25,
            },
            {
              name: 'gsap-vendor',
              test: /node_modules\/gsap\//,
              priority: 20,
            },
            {
              name: 'icons-vendor',
              test: /node_modules\/lucide-react\//,
              priority: 15,
            },
          ],
        },
      },
    },
  },
})
