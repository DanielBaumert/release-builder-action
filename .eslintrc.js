module.exports = {
    env: {
        node: true,
    },
    extends: [
        'airbnb-base',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 4],
        'no-console': 'off',
        'no-bitwise': 'off',
        'no-restricted-syntax': 'off',
        'no-continue': 'off',
        'no-await-in-loop': 'off',
    },
};
