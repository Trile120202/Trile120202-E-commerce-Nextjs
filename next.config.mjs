/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos','utfs.io'],
      },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverComponentsExternalPackages: ['knex']
    },
};

export default nextConfig;
