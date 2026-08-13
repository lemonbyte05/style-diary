/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F6F1E8",
          deep: "#EFE7DA",
          soft: "#FDFAF3",
        },
        edge: "#E5DCCB",
        ink: {
          DEFAULT: "#332C25",
          soft: "#6C5F53",
          faint: "#9C8E80",
        },
        rose: {
          DEFAULT: "#C98A7A",
          deep: "#B06F60",
          wash: "#F3E4DE",
        },
        peach: "#E9B49B",
        lavender: "#B7A5C4",
        dustyblue: "#9DB2C4",
        sage: "#A6B39F",
        butter: "#D8BE8D",
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
        "1": "0 1px 12px rgba(51, 44, 37, 0.06)",
        "2": "0 2px 16px rgba(51, 44, 37, 0.08)",
        "3": "0 8px 32px rgba(51, 44, 37, 0.10)",
        hero: "0 12px 48px rgba(51, 44, 37, 0.14)",
        polaroid: "0 4px 10px rgba(51, 44, 37, 0.08), 0 1px 4px rgba(51, 44, 37, 0.05)",
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
