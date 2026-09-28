import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  // Mermaid is only reached through a dynamic import, so Vite wouldn't find it at startup and would
  // re-bundle it mid-session, failing that first request with "504 Outdated Optimize Dep".
  optimizeDeps: {
    include: ['mermaid'],
  },
})
