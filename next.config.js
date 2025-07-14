/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Enable Web Workers
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/,
      loader: 'worker-loader',
      options: {
        filename: 'static/[hash].worker.js',
        publicPath: '/_next/',
        inline: 'no-fallback',
      },
    })

    // Fix Worker instantiation in development
    if (dev && !isServer) {
      config.output.publicPath = '/_next/'
    }

    // Fix mini-css-extract-plugin error
    if (!isServer) {
      config.output.globalObject = 'self'
    }

    return config
  }
}

module.exports = nextConfig 