import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: repo name must match EXACTLY your GitHub repo
export default defineConfig({
  plugins: [react()],
  base: '/Workout-Tracker/', 
})