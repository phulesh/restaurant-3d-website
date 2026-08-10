import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // The live-preview environment uses a dynamic host – allow it.
    allowedHosts: true,
  },
  preview: {
    host: true,
    // Railway (and the live preview) inject a dynamic host/port – allow them.
    allowedHosts: true,
  },
  build: {
    target: 'es2018',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        // Split the heavy 3D engine into its own lazy chunk.
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
