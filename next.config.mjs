/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack(config) {
	    config.externals.push({ '@lancedb/lancedb': '@lancedb/lancedb' })
	    config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }
	    return config;
	},
	experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    }
}

export default nextConfig;
