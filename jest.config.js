module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // The react-native preset only transforms react-native* and @react-native*.
  // Several dependencies ship ESM that Jest cannot require untransformed, so
  // they are added here. Extends the preset's own pattern rather than
  // replacing it.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?' +
      '|react-native-keyboard-controller' +
      '|@react-navigation' +
      '|react-native-vector-icons' +
      '|react-native-safe-area-context' +
      '|react-native-screens' +
      '|toastify-react-native' +
      '|react-i18next|i18next' +
      ')/)',
  ],
};
