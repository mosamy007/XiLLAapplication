/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#04060d',
        'cyber-dark': '#060a17',
        'cyber-navy': '#0c1329',
        'cyber-panel': '#0a0f22',
        'cyber-card': '#0d1633',
        'neon-cyan': '#00F3FF',
        'neon-pink': '#FF007A',
        'neon-green': '#00FF66',
        'neon-yellow': '#FFE600',
        'danger-red': '#FF2A4B',
        'kaiju-purple': '#A020F0',
        'kaiju-violet': '#7928CA',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        arcade: ['"VT323"', 'monospace'],
        tech: ['"Share Tech Mono"', 'monospace'],
        silkscreen: ['"Silkscreen"', 'cursive'],
      },
      boxShadow: {
        'pixel-cyan': '3px 3px 0px #00F3FF',
        'pixel-pink': '3px 3px 0px #FF007A',
        'pixel-green': '3px 3px 0px #00FF66',
        'pixel-yellow': '3px 3px 0px #FFE600',
        'pixel-dark': '4px 4px 0px #000000',
        'glow-cyan': '0 0 15px rgba(0, 243, 255, 0.4)',
        'glow-pink': '0 0 15px rgba(255, 0, 122, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
    },
  },
  plugins: [],
}
