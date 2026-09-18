import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/project-future-ready", destination: "/initiatives/future-pathways", permanent: true },
      { source: "/initiatives/project-future-ready", destination: "/initiatives/future-pathways", permanent: true },
      { source: "/future-pathways", destination: "/initiatives/future-pathways", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/vyiwmedy/**",
      },
    ],
  },
};

export default nextConfig;
