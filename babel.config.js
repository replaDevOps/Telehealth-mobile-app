module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        cwd: 'babelrc',
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        alias: {
          '@src': './src',
          '@assets': './src/assets',
          '@components': './src/components',
          '@config': './src/config',
          '@constants': './src/constants',
          '@context': './src/context',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@services': './src/services',
          '@types': './src/types',
          '@store': './src/store',
          '@utils': './src/utils',
        },
      },
    ],
    // Reanimated 4 compiles worklets through this plugin (it moved out of
    // react-native-reanimated into react-native-worklets). It must stay LAST -
    // it rewrites functions the other plugins have already transformed.
    'react-native-worklets/plugin',
  ],
};
