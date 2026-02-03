import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        {
            name: 'multi-page-rewrite-plugin',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    const url = req.url?.split('?')[0];

                    // Define the routes that need to map to their own index.html
                    const customRoutes = ['/callback', '/notAnAdmin'];

                    if (url && customRoutes.includes(url)) {
                        req.url = `${url}/index.html`;
                    }
                    next();
                });
            },
        },
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                dashboard: resolve(__dirname, 'dashboard/index.html'),
                callback: resolve(__dirname, 'callback/index.html'),
                notAnAdmin: resolve(__dirname, 'notAnAdmin/index.html'),
            },
        },
    },
})