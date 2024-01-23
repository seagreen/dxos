/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['src/vitest/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    browser: {
      headless: false,
    },
  },
  resolve: {
    alias: {
      buffer: 'node:buffer',
    },
  },
});
