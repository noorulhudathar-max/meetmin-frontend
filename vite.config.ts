// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '127.0.0.1', // Forces Vite to use IPv4 loopback explicitly
//     port: 5173,        // Ensures it runs strictly on port 5173
//     hmr: {
//       host: '127.0.0.1',
//       protocol: 'ws',  // Uses unencrypted WebSockets for local environments
//       port: 5173,      // Matches your main server port
//     },
//   },
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      }
    }
  },
})
