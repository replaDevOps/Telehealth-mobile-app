/**
 * Native modules have no implementation under Jest, so any module that touches
 * one at import time throws before a test can run.
 *
 * App.tsx renders <KeyboardProvider>, and the library reads its native module
 * as a side effect of being imported. This is the mock the library publishes
 * for exactly that purpose.
 */
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);
