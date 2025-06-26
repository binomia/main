import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin"; // Make sure to install @typescript-eslint/eslint-plugin
import parser from "@typescript-eslint/parser"; // Install @typescript-eslint/parser as well

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: globals.commonjs,
      parser: parser,
    },
    linterOptions: {
      noInlineConfig: true,
    },
    // rules: {
    // //   "@typescript-eslint/no-explicit-any": "off", // Turn off the rule for 'any' type
	// //   "@typescript-eslint/no-unused-vars": "error", // Turn on the rule for unused variables
    // },
  },
  ...tseslint.configs.recommended, // Spread the recommended config from typescript-eslint
];
