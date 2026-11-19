import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const googleClientIdKey = 'VITE_GOOGLE_CLIENT_ID'
  const modeEnv = loadEnv(mode, process.cwd(), googleClientIdKey)
  const exampleEnv = loadEnv('example', process.cwd(), googleClientIdKey)

  if (
    modeEnv[googleClientIdKey] === undefined
    && process.env[googleClientIdKey] === undefined
    && exampleEnv[googleClientIdKey] !== undefined
  ) {
    process.env[googleClientIdKey] = exampleEnv[googleClientIdKey]
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': 'http://localhost:5000',
      },
    },
  }
})
