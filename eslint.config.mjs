// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  // {
  //   ignores: [".output/**", ".tanstack/**", ".nitro/**", "coverage/**"],
  // },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: "only-allowed-literals",
        },
      ],
      "@typescript-eslint/only-throw-error": [
        "error",
        {
          "allow": [
            {
              "from": "package",
              "package": "@tanstack/router-core",
              "name": "Redirect"
            }
          ]
        }
      ]
    },
  },
]);
