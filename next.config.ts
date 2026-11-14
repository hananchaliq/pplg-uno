import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   reactStrictMode: true,
   // Wajib ada di Next.js 16 agar Turbopack tidak error saat membaca config
   turbopack: {},
   typescript: {
      ignoreBuildErrors: false,
   },
   images: {
      dangerouslyAllowSVG: true,
      remotePatterns: [
         {
            protocol: "https",
            hostname: "**",
         },
      ],
   },
   output: "standalone",
   transpilePackages: ["motion"],
   webpack: (config, { dev }) => {
      if (dev && process.env.DISABLE_HMR === "true") {
         config.watchOptions = {
            ignored: /.*/,
         };
      }
      return config;
   },
};

export default nextConfig;
