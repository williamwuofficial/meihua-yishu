import { defineConfig } from 'vite';

// Served from https://williamwuofficial.github.io/meihua-yishu/ — every asset URL must be relative.
export default defineConfig({
  base: '/meihua-yishu/',
  build: {
    target: 'es2022',
    // Five pages: cast, history, learn, method & sources, settings.
    rollupOptions: { input: { main: 'index.html', learn: 'learn.html', about: 'about.html', settings: 'settings.html', history: 'history.html' } },
  },
});
