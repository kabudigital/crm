import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        'recharts',
        'lucide-react',
        'qrcode.react',
        '@supabase/supabase-js',
        'react/jsx-runtime'
      ]
    }
  }
})