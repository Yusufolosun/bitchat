import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendModules = path.resolve(__dirname, 'node_modules')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(frontendModules, 'react'),
      'react-dom': path.resolve(frontendModules, 'react-dom'),
      'react/jsx-runtime': path.resolve(frontendModules, 'react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(frontendModules, 'react/jsx-dev-runtime'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    server: {
      deps: {
        fallbackCJS: true,
      },
    },
  },
})
