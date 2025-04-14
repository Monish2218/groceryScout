module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'plugin:@typescript-eslint/recommended',
      'prettier', // Uses eslint-config-prettier to disable ESLint rules that conflict with Prettier
      'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays Prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    parserOptions: {
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
    },
    rules: {
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
      // e.g., "@typescript-eslint/explicit-function-return-type": "off",
    },
  };