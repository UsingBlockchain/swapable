/**
 * This file is part of Swapable shared under AGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     Swapable
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     AGPL-3.0
 */

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/member-delimiter-style": [
      2,
      {
        "multiline": {
          "delimiter": "none",
          "requireLast": false
        },
        "singleline": {
          "delimiter": "comma",
          "requireLast": false
        }
      }
    ],
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/semi": [2, "never"],
    "@typescript-eslint/no-namespace": "off",
    "array-bracket-spacing": [
      "error",
      "always",
      { "singleValue": false, "objectsInArrays": false },
    ],
    "ban-ts-ignore": "off",
    "comma-dangle": ["error", "always-multiline"],
    "curly": ["error", "multi-line"],
    "eol-last": ["error", "always"],
    "indent": "off",
    "import/prefer-default-export": "off",
    "interface-name": 0,
    "linebreak-style": 0,
    'max-len': ['error', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    "no-console": ["error", { allow: ["log", "info", "error"] }],
    "no-ex-assign": "error",
    "no-extra-boolean-cast": 0,
    "no-loop-func": "error",
    "no-multi-spaces": "error",
    "no-multiple-empty-lines": 2,
    "no-return-assign": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-var": "error",
    "object-literal-sort-keys": 0,
    "prefer-const": "error",
    "prefer-template": "off",
    "quotes": ["error", "single"],
    "space-infix-ops": "error",
    "space-unary-ops": [
      2, {
        "words": true,
        "nonwords": false,
        "overrides": {
          "new": false,
          "++": true
        }
      }],
    "spaced-comment": ["error", "always", { "markers": ["/"] }],
    "template-curly-spacing": "error"
  }
};
