/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos','utfs.io'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
      },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['knex'],
        optimizeCss: false,
    },




};

export default nextConfig;
