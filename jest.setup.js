/* global jest */
// Native modules that have no implementation under Jest.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
