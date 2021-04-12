module.exports = {
  presets: ['@babel/env', '@babel/react', '@babel/typescript'],
  plugins: [
    'babel-plugin-typescript-to-proptypes',
    [
      'inline-react-svg',
      {
        ignorePattern: 'images/.*.svg',
        svgo: {
          plugins: [
            { mergePaths: false },
            { convertPathData: false },
            {
              cleanupIDs: {
                prefix: {
                  toString() {
                    this.counter = this.counter || 0;

                    return `sbkit-${this.counter++}_`;
                  },
                },
              },
            },
          ],
        },
      },
    ],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          src: './src',
        },
      },
    ],
    [
      'inline-import-data-uri',
      {
        extensions: ['svg', 'png', 'otf'],
      },
    ],
    ['emotion', { autolabel: true }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-optional-chaining'],
    ['@babel/plugin-proposal-nullish-coalescing-operator'],
  ],
  ignore: ['**/*.test.tsx', '**/*.d.ts'],
};
