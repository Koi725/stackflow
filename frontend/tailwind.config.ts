import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    fontFamily: { sans: ["var(--font-archivo)", "system-ui", "sans-serif"] },
    borderRadius: { none: "0", DEFAULT: "0", sm: "0", md: "0", lg: "0", full: "0" },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        accent: { DEFAULT: "#ec3013", hover: "#dd2b0f", active: "#ae1800", soft: "#ff9783" },
        rule: "var(--rule)",
        "rule-soft": "var(--rule-soft)",
        hairline: "var(--hairline)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,.2)",
        ghost: "0 24px 48px rgba(0,0,0,.55), 0 0 0 2px #ec3013",
        dialog: "0 12px 32px rgba(0,0,0,.5)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(.2,.8,.2,1)",
        cine: "cubic-bezier(.7,0,.2,1)",
      },
      keyframes: {
        wipe: { from: { clipPath: "inset(0 100% 0 0)" }, to: { clipPath: "inset(0 0 0 0)" } },
        rise: { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        pop: { from: { opacity: "0", transform: "translateY(18px) scale(.97)" }, to: { opacity: "1", transform: "none" } },
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".3" } },
        scan: { from: { transform: "translateY(-100%)" }, to: { transform: "translateY(100vh)" } },
        driftA: { "0%,35%": { transform: "translate(0,0)" }, "55%,100%": { transform: "translate(var(--cw),34px)" } },
        driftB: { "0%,50%": { transform: "translate(0,0)" }, "70%,100%": { transform: "translate(var(--cw),-60px)" } },
        driftC: { "0%,20%": { transform: "translate(0,0)" }, "40%,100%": { transform: "translate(calc(var(--cw) * 2),20px)" } },
      },
      animation: {
        wipe: "wipe .7s cubic-bezier(.7,0,.2,1) both",
        rise: "rise .8s cubic-bezier(.2,.8,.2,1) both",
        fade: "fade .25s both",
        pop: "pop .35s cubic-bezier(.2,.8,.2,1) both",
        pulse2: "pulse2 2s infinite",
        scan: "scan 9s linear infinite",
        driftA: "driftA 9s cubic-bezier(.7,0,.2,1) infinite",
        driftB: "driftB 11s cubic-bezier(.7,0,.2,1) infinite 4s",
        driftC: "driftC 13s cubic-bezier(.7,0,.2,1) infinite 2s",
      },
    },
  },
  plugins: [],
} satisfies Config;
