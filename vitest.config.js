import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',

    // 👉 SOLO tests unitarios
    include: ['test/unit/**/*.test.js'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.js'
      ]
    }
  }
});
