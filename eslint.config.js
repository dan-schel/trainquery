// @ts-nocheck

import eslint from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
  {
    ignores: ["node_modules/", "dist/", "eslint.config.js", "instance/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },
  {
    rules: {
      // Allow single-word Vue component names.
      "vue/multi-word-component-names": 0,

      // Warn about missing semicolons.
      semi: "warn",

      // Ignore unused variables if they start with underscores.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Require === and !==, except when comparing to null.
      eqeqeq: ["error", "always", { null: "ignore" }],

      // Warn on console.log uses, but allow console.warn.
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },

  ...pluginVue.configs["flat/recommended"],

  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
    },
  },

  prettier,
);
