import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Configuração para JavaScript e TypeScript
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  },
  // Configurações adicionais, se necessário
  {
    rules: {
      semi: ["error", "always"],
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          ts: "never",
        },
      ],
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error"],
      "@typescript-eslint/no-unused-vars": [2, { args: "none" }],
      "import/prefer-default-export": "off",
      "class-methods-use-this": "off",
      "max-classes-per-file": "off",
      "no-array-constructor": "off",
      "no-useless-constructor": "off",
      "no-empty-function": "off",
      "no-underscore-dangle": "off",
    },
  }
);
