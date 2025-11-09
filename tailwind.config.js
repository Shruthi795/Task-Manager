/**
 * Minimal Tailwind config file. The previous file accidentally contained CSS
 * and caused the project to fail JS parsing. Keep this minimal config so
 * Tailwind (if used) works correctly. If Tailwind isn't used in the project
 * this still provides a harmless default export.
 */
module.exports = {
  content: [
    './frontend/src/**/*.{js,jsx,ts,tsx}',
    './frontend/public/index.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
