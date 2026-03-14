import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#354E5E',   // dark teal — logo card background
          dark:    '#1E3340',   // deeper teal for hover/dark surfaces
          light:   '#2A4050',   // mid teal for secondary surfaces
          accent:  '#E8611A',   // orange-red — right side of PWRD gradient
          gold:    '#F5A820',   // amber/gold — left side of PWRD gradient
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #F5A820 0%, #E8611A 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}

export default config
