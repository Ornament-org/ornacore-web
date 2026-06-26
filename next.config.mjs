/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
