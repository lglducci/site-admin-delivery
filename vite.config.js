 // vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Produção
      '/api/webhook': {
        target: 'https://webhook.lglducci.com.br/webhook',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api\/webhook/, ''), // -> /modelos_custo...
      },
      // Teste (n8n webhook-test)
      '/api/n8n': {
        target: 'https://n8n.lglducci.com.br/webhook-test',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api\/n8n/, ''), // -> /modelos_custo...
      },
    },
  },
})
