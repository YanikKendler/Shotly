import pkg from './package.json' assert { type: 'json' };

const nextConfig = {
    output: "standalone",
    env: {
        NEXT_PUBLIC_APP_VERSION: pkg.version,
        NEXT_PUBLIC_BUILD_DATE: new Date().toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }),
    },
};

export default nextConfig;
