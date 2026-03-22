export const locales = ["en", "zh-CN"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";
