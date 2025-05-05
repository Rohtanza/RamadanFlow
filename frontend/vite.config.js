// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
                            server: {
                              port: 3001,               // ← your new front-end port
                              proxy: {
                                '/api': {
                                  target: 'http://localhost:5000',
                                  changeOrigin: true,
                                },
                              },
                            },
});
