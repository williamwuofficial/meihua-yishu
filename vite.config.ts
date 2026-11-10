import { defineConfig } from 'vite';

// Served from https://williamwuofficial.github.io/meihua-yishu/ — every asset URL must be relative.
export default defineConfig({
  base: '/meihua-yishu/',
  build: { target: 'es2022' },
});
