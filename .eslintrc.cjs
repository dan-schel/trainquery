/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  rules: {
    // Allow single-word Vue component names.
    "vue/multi-word-component-names": 0,

    // Warn about missing semicolons.
    semi: "warn",

    // Ignore unused variables if they start with underscores.
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

    // Require === and !==, except when comparing to null.
    eqeqeq: ["error", "always", { null: "ignore" }],

    // Warn on console.log uses, but allow console.warn.
    "no-console": ["warn", { allow: ["warn"] }],
  },
  parserOptions: {
    ecmaVersion: "latest",
  },
};
