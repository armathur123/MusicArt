/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'scontent-ord5-2.xx.fbcdn.net',
                port: ''
            }
        ]
    }
    
};

module.exports = nextConfig;
