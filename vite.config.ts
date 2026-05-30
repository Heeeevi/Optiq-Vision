import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Only use SSL in dev mode — Netlify handles HTTPS in production
    ...(command === 'serve' ? [basicSsl()] : []),
  ],
}))
