import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'https://test.nicehairvietnam.com',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
