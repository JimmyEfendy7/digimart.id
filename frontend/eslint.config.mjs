import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js recommended configs (includes TypeScript)
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Project-level overrides to keep linting enabled without blocking builds on stylistic issues
  {
    name: "project-overrides",
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default eslintConfig;
