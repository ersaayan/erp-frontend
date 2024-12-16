import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "next", "prettier"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
    ignorePatterns: [
      "node_modules",
      ".next",
      "out",
      "public",
      "coverage",
      "components/ui/",
    ],
  }),
];

export default eslintConfig;
