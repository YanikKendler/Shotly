import pkg from './package.json' assert { type: 'json' };

const nextConfig = {
    output: "standalone",
    env: {
        NEXT_PUBLIC_APP_VERSION: pkg.version,
        NEXT_PUBLIC_BUILD_DATE: new Date().toLocaleDateString('de-DE', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
    },
};

export default nextConfig;
