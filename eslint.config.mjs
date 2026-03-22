import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));
const nextSettings = {
  next: {
    rootDir: "apps/web/",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals.map((config) => ({
    ...config,
    files: ["apps/web/**/*.{js,mjs,ts,tsx,mts,cts}"],
    settings: {
      ...(config.settings ?? {}),
      ...nextSettings,
    },
    rules: {
      ...(config.rules ?? {}),
      "@next/next/no-html-link-for-pages": "off",
    },
  })),
  ...nextTs.map((config) => ({
    ...config,
    files: ["apps/web/**/*.{js,mjs,ts,tsx,mts,cts}"],
    settings: {
      ...(config.settings ?? {}),
      ...nextSettings,
    },
    rules: {
      ...(config.rules ?? {}),
      "@next/next/no-html-link-for-pages": "off",
    },
  })),
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    settings: {
      next: {
        rootDir: ["apps/web/"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "import/no-duplicates": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "sort-imports": [
        "error",
        {
          allowSeparatedGroups: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: true,
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    "**/.source/**",
    "**/src/components/ai-elements/**",
  ]),
]);

export default eslintConfig;
