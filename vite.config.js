 export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/webhook': {
        target: 'https://webhook.lglducci.com.br/webhook',
        changeOrigin: true,
        secure: false, // ok no dev; se o cert for válido pode ser true
        rewrite: (p) => p.replace(/^\/api\/webhook/, ''),
      },
      '/api/n8n': {
        target: 'https://n8n.lglducci.com.br/webhook-test',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api\/n8n/, ''),
      },
    },
  },
});
