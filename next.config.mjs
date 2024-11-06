/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos','utfs.io'],
      },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
