const nextConfig = {
  output: 'standalone',
  // Add this to ensure correct static paths in production:
  //assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' }
        ]
      }
    ];
  }
};

export default nextConfig;
