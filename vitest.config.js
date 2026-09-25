import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/unit/setup.js',
    include: ['tests/unit/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/assets/**',
        'src/PaperShatter/**',
        'src/Galaxy.jsx',
        'src/ClickSpark.jsx',
        'src/index.css',
        'src/App.css',
        'src/Galaxy.css',
      ],
    },
  },
})
