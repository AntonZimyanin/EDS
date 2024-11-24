import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/eds/',
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        outDir: 'dist', // Output directory
        rollupOptions: {
            input: fileURLToPath(new URL(__dirname, 'index.html')),
        },
    },
});
