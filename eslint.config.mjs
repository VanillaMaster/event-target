import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-namespace": ["error", {
                allowDeclarations: true,
            }],
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_"
            }],
            "@typescript-eslint/consistent-type-imports": "error"
        }
    },
    globalIgnores(["*", "!src"])
);