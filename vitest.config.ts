import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Allow accessing environment variables
    environmentVariables: {
      // We'll set these in the test setup or let vitest handle them
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});