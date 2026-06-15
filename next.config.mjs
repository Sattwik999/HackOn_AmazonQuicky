// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   // Add the allowed origin here to fix the HMR blocked issue
//   allowedDevOrigins: ['192.168.0.105'],
// }

// export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow your local IP and wildcard domains for popular tunneling services
  allowedDevOrigins: [
    '192.168.0.105',       // Your local network IP
    '*.ngrok-free.app',    // ngrok free domains
    '*.ngrok.io',          // ngrok premium/legacy domains
    '*.loca.lt',           // localtunnel
    '*.serveo.net',        // Serveo
    '*.trycloudflare.com', // Cloudflare Quick Tunnels
    '*.pinggy.link'        // Pinggy
  ],
}

export default nextConfig;