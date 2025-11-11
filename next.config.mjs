import { resolve } from "path";
import { fileURLToPath } from "url";

const cacheDir = resolve(".next/cache/webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.cache = {
      type: "filesystem",
      buildDependencies: {
        config: [fileURLToPath(import.meta.url)],
      },
      cacheDirectory: cacheDir, // Теперь путь абсолютный
      store: "pack",
      compression: "gzip",
      version: "1",
    };
    return config;
  },
};

export default nextConfig;
