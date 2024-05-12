export const AppConfig = {
  site_name: "Metacrypt",
  title: "Uniswap V3 Simulator & Calculator",
  description:
    "Easily calculate and track fees generated from Uniswap V3 positions as well as get meaningful insights on volume, prices and investment returns including APR.",
  locale: "en",
  base: "https://www.metacrypt.org",
} as const;

export const GOOGLE_ANALYTICS_ID = process.env.NODE_ENV === "production" ? "G-5R6ZE713DN" : "";
