import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow /preview to be embedded in iframes from CMS (localhost + CloudFront)
        source: '/preview',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://localhost:* https://*.cloudfront.net https://admin-quiniela.nuestrodiario.com.gt",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
