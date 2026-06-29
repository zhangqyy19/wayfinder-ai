/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow fetching from OSM / OSRM / Overpass
  async headers() {
    return [];
  },
};

module.exports = nextConfig;