
import path from 'path';
import { fileURLToPath } from 'url';

// Next.js 16+ ESM config
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Removed for Netlify SSR/serverless compatibility
    turbopack: {
        // Explicitly set root so Turbopack resolves the Next package from the workspace root
        root: path.resolve(__dirname),
    },
    // Turbopack is enabled via CLI, not config. Remove this key.
    // Custom headers (still supported in Next.js 16)
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },

    // Modern Webpack config for browser polyfills/aliases
    webpack(config, { isServer }) {
        if (!isServer) {
            // Next.js 16+ no longer polyfills Node.js core modules by default
            // Only add fallbacks for modules you actually use in the browser
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                stream: false,
                http: false,
                https: false,
                zlib: false,
            };

            // Aliasing problematic modules to false (no-op) for browser builds
            config.resolve.alias = {
                ...config.resolve.alias,
                '@rarible/tezos-sdk': false,
                '@rarible/tezos-sdk/dist/order/sell': false,
                '@rarible/tezos-sdk/dist/common/base': false,
                '@react-native-async-storage/async-storage': false,
            };
        }
        return config;
    },

    // (Optional) Add future Next.js config options here
    // experimental: {},
};

export default nextConfig;