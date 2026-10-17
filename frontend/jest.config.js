module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/asyncStorageMock.ts',
    '^\\./src/app/navigation/RootNavigator$':
      '<rootDir>/__mocks__/rootNavigatorMock.tsx',
    '^@react-native-community/slider$': '<rootDir>/__mocks__/sliderMock.tsx',
    '^react-native-reanimated$': '<rootDir>/__mocks__/reanimatedMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@react-native-async-storage|@react-native-linear-gradient|react-native-linear-gradient|react-native-reanimated|react-native-vector-icons|react-native-screens|react-native-webview|@react-native-vector-icons|@react-native-community)/)',
  ],
};
