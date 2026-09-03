module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-reanimated|react-native-gesture-handler)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Informe de Pruebas NexBit Móvil',
      outputPath: './test-report/index.html',
      includeFailureMessages: false,
      includeConsoleLog: false,
    }],
  ],
};
