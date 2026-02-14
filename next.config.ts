import type { NextConfig } from 'next';

const repo = 'hanini';
const nextConfig: NextConfig = {
  output: 'export',
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  reactCompiler: true,
};

export default nextConfig;
