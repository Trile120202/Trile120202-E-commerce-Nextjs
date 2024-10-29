/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos'],
      },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
