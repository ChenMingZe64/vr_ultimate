import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "threejs.org",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
