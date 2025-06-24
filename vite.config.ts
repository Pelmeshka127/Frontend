import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],

  server: {
    proxy: {
      
      '/swagger-ui': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/v3/api-docs': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api-docs': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/swagger-resources': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8081',  // Адрес бэкенда
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Solves long loading due to tabler, see https://stackoverflow.com/questions/79194970/tabler-icons-for-react-slowing-down-app-on-initial-load
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  define: {
    global: 'window',
  }
})

