// /** @type {import("eslint").Linter.Config} */
// const config = {
//   "parser": "@typescript-eslint/parser",
//   "parserOptions": {
//     "project": true
//   },
//   "plugins": [
//     "@typescript-eslint"
//   ],
//   "extends": [
//     "next/core-web-vitals",
//     "plugin:@typescript-eslint/recommended-type-checked",
//     "plugin:@typescript-eslint/stylistic-type-checked"
//   ],
//   "rules": {
//     "@typescript-eslint/array-type": "warn",
//     "@typescript-eslint/consistent-type-definitions": "warn",
//     '@typescript-eslint/prefer-nullish-coalescing': 'off',
//     '@typescript-eslint/no-unsafe-assignment': 'off',
//     '@typescript-eslint/no-unsafe-call': 'off',
//     '@typescript-eslint/no-unsafe-member-access': 'off',
//     '@typescript-eslint/no-empty-function': 'off',
//     '@typescript-eslint/no-var-requires': 'off',
//     "@typescript-eslint/consistent-type-imports": [
//       "warn",
//       {
//         "prefer": "type-imports",
//         "fixStyle": "inline-type-imports"
//       }
//     ],
//     "@typescript-eslint/no-unused-vars": [
//       "warn",
//       {
//         "argsIgnorePattern": "^_"
//       }
//     ],
//     "@typescript-eslint/require-await": "off",
//     "@typescript-eslint/no-misused-promises": [
//       "warn",
//       {
//         "checksVoidReturn": {
//           "attributes": false
//         }
//       }
//     ]
//   }
// }
// module.exports = config;





/** @type {import("eslint").Linter.Config} */
const config = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "rules": {
    "@typescript-eslint/array-type": "warn", // Keeping this as a warning
    "@typescript-eslint/consistent-type-definitions": "off", // Disable 'type' vs 'interface' rule
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-argument': "warn",
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/restrict-template-expressions': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    "@typescript-eslint/consistent-type-imports": "off", // Disable type imports enforcement
    "@typescript-eslint/no-unused-vars": "off", // Disable unused variables check
    "@typescript-eslint/require-await": "off", // Already off
    "@typescript-eslint/no-unnecessary-type-assertion": "off", // Disable unnecessary type assertion warnings
    '@typescript-eslint/no-floating-promises': 'off',
    "react/no-unescaped-entities": 0,
    "@typescript-eslint/no-misused-promises": [
      "warn",
      {
        "checksVoidReturn": {
          "attributes": false
        }
      }
    ]
  }
}
module.exports = config;
