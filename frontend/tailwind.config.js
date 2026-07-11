/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#E6F0FA",
          100: "#CCE0F5",
          200: "#99C2EB",
          300: "#66A3E0",
          400: "#3385D6",
          500: "#0066CC",  // main primary
          600: "#0052A3",
          700: "#004080",
          800: "#002D5C",
          900: "#001A38",
        },
        secondary: {
          50:  "#E6F7F2",
          100: "#CCEFE5",
          200: "#99DFCB",
          300: "#66CFB1",
          400: "#33BF97",
          500: "#00A86B",  // main secondary
          600: "#008F5A",
          700: "#007A4D",
          800: "#005C3A",
          900: "#003D26",
        },
        accent: {
          light:   "#E8F4FD",
          DEFAULT: "#B3D9F7",
          dark:    "#7DBEF0",
        },
        background: {
          DEFAULT: "#F8FAFC",
          card:    "#FFFFFF",
          muted:   "#F1F5F9",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          raised:  "#F8FAFC",
          overlay: "#F1F5F9",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          error:   "#EF4444",
          info:    "#3B82F6",
        },
      },
      fontFamily: {
        sans:    ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Poppins", "Inter", "ui-sans-serif", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      backgroundImage: {
        "gradient-primary":   "linear-gradient(135deg, #0066CC 0%, #0052A3 50%, #004080 100%)",
        "gradient-secondary": "linear-gradient(135deg, #00A86B 0%, #008F5A 50%, #007A4D 100%)",
        "gradient-hero":      "linear-gradient(135deg, #0066CC 0%, #00A86B 100%)",
        "gradient-card":      "linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)",
        "gradient-accent":    "linear-gradient(135deg, #E8F4FD 0%, #CCE0F5 100%)",
        "gradient-dark":      "linear-gradient(135deg, #004080 0%, #002D5C 100%)",
        "gradient-radial":    "radial-gradient(ellipse at center, #E8F4FD 0%, #F8FAFC 70%)",
      },
      boxShadow: {
        card:    "0 2px 8px rgba(0, 102, 204, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 24px rgba(0, 102, 204, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08)",
        primary: "0 4px 14px rgba(0, 102, 204, 0.35)",
        secondary: "0 4px 14px rgba(0, 168, 107, 0.35)",
        inner:   "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
        glow:    "0 0 20px rgba(0, 102, 204, 0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      animation: {
        "fade-in":     "fadeIn 0.5s ease-in-out",
        "slide-up":    "slideUp 0.4s ease-out",
        "slide-down":  "slideDown 0.4s ease-out",
        "slide-left":  "slideLeft 0.4s ease-out",
        "slide-right": "slideRight 0.4s ease-out",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "spin-slow":   "spin 3s linear infinite",
        "ping-slow":   "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        slideDown: {
          "0%":   { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",     opacity: "1" },
        },
        slideLeft: {
          "0%":   { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)",    opacity: "1" },
        },
        slideRight: {
          "0%":   { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)",     opacity: "1" },
        },
      },
      transitionTimingFunction: {
        "bounce-in":  "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      screens: {
        "xs": "475px",
        "3xl": "1920px",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [],
};
