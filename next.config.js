/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.scdn.co'
            },
            {
                protocol: 'https',
                hostname: '**.spotifycdn.com'
            },
            {
                protocol: 'https',
                hostname: '**fbcdn.net'
            },
            {
                protocol: 'https',
                hostname: 'scontent-ord5**'
            }
        ]
      
    }
    
};

module.exports = nextConfig;
