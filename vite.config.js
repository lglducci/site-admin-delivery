  import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // >>> NOVO: usa n8n de TESTE (webhook-test)
      '/api/n8n': {
        target: 'https://n8n.lglducci.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, '/webhook-test'),
      },

      // já existia (produção)
      '/api/webhook': {
        target: 'https://webhook.lglducci.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/webhook/, '/webhook'),
      },

      // já existia (detalhes)
      '/api/pedido_detalhado': {
        target: 'https://webhook.lglducci.com.br',
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/api\/pedido_detalhado/, '/webhook/pedido_detalhado'),
      },
    },
  },
})
