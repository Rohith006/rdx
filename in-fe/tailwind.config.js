module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        "primary-button": "#F4263E",
        "secondary-button": "#D7E0FF",
        "primary-border": "#E8E8E8",
        "secondary-border": "#E0E0E0CC",
        "ternary-border": "#CCCCCC",
        "success-border": "#008C00",
        "danger-border": "#d81b60",
        "primary": {DEFAULT: "#E8E8E8"},
        "secondary-bg": "#E0E0E0CC",
        "primary-text": "#222222",
        "secondary-text": "#444444",
        "neutral-text": "#888888", 
        "primary-icon": "#666666",
      },
      transitionProperty: {
        'width': 'width',
      }
    },
  },
  plugins: [],
}
