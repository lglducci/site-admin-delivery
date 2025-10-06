 


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/webhook': {
        target: 'https://webhook.lglducci.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/webhook/, '/webhook'),
      },
      '/api/pedido_detalhado': {
        target: 'https://webhook.lglducci.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pedido_detalhado/, '/webhook/pedido_detalhado'),
      },
    },
  },
})
