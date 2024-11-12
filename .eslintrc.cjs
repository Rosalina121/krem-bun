module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module', },
    settings: { react: { version: '18.2' } },
    plugins: ['react-refresh', "@typescript-eslint", "react"],
    rules: {},
}
