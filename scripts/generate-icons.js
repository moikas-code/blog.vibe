// This script would normally generate icons
// For now, we'll create placeholder icons
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000"/>
  <text x="256" y="256" font-family="monospace" font-size="72" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">MS</text>
</svg>`;

// Save as placeholder icon
fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), svgIcon);

console.log('Icon placeholder created. Replace with actual icons for production.');
console.log('Required icons:');
console.log('- /public/icon-192x192.png');
console.log('- /public/icon-384x384.png');
console.log('- /public/icon-512x512.png');