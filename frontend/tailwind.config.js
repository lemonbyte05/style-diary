/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "rgb(var(--c-paper) / <alpha-value>)",
          deep: "rgb(var(--c-paper-deep) / <alpha-value>)",
          soft: "rgb(var(--c-paper-soft) / <alpha-value>)",
        },
        edge: "rgb(var(--c-edge) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          soft: "rgb(var(--c-ink-soft) / <alpha-value>)",
          faint: "rgb(var(--c-ink-faint) / <alpha-value>)",
        },
        rose: {
          DEFAULT: "rgb(var(--c-rose) / <alpha-value>)",
          deep: "rgb(var(--c-rose-deep) / <alpha-value>)",
          wash: "rgb(var(--c-rose-wash) / <alpha-value>)",
        },
        peach: "rgb(var(--c-peach) / <alpha-value>)",
        lavender: "rgb(var(--c-lavender) / <alpha-value>)",
        dustyblue: "rgb(var(--c-dustyblue) / <alpha-value>)",
        sage: "rgb(var(--c-sage) / <alpha-value>)",
        butter: "rgb(var(--c-butter) / <alpha-value>)",
        moss: "#7F8F7A",
        honey: "#C9A24B",
        terra: "#C0695C",
      },
      borderRadius: {
        sm: "4px",
        md: "12px",
        lg: "20px",
        xl: "28px",
        full: "999px",
      },
      fontFamily: {
        serif: ['"Songti SC"', '"Noto Serif SC"', '"SimSun"', "serif"],
        sans: ['"PingFang SC"', '"Noto Sans SC"', '"Microsoft YaHei"', "sans-serif"],
        hand: ['"Hannotate SC"', '"Kaiti SC"', '"KaiTi"', "cursive"],
      },
      fontSize: {
        folio: ["11px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        caption: ["13px", { lineHeight: "18px" }],
        body: ["16px", { lineHeight: "26px" }],
        h2: ["18px", { lineHeight: "24px" }],
        title: ["26px", { lineHeight: "32px" }],
        hero: ["40px", { lineHeight: "44px", letterSpacing: "0.5px" }],
      },
      boxShadow: {
        "1": "var(--sh-1)",
        "2": "var(--sh-2)",
        "3": "var(--sh-3)",
        hero: "var(--sh-hero)",
        polaroid: "var(--sh-polaroid)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        petal: {
          "0%": { transform: "translateY(-8px) rotate(0deg)", opacity: "0" },
          "20%": { opacity: "0.7" },
          "100%": { transform: "translateY(80vh) rotate(120deg)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        float: "float 4s ease-in-out infinite",
        petal: "petal 9s linear infinite",
      },
    },
  },
  plugins: [],
};
