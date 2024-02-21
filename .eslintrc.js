/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./apps/*/tsconfig.json",
      "./packages/*/tsconfig.json",
    ],
  },
  settings: {
    next: {
      rootDir: ["apps/web"]
    },
  },
  extends: ["turbo", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    "react/display-name": "off",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-import-type-side-effects": "error",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
  },
  ignorePatterns: ["**/*.config.js", "**/*.config.cjs", "packages/config/**"],
  reportUnusedDisableDirectives: true,
};

module.exports = config;
