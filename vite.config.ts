import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    plugins: [vue()],

    server: {
        host: '0.0.0.0', 
        port: 5174,
    },
    define: {
        'process.env': process.env,
    },
    base: '/eds/',
});
