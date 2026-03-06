export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/frontend/test'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  moduleFileExtensions: ['js', 'json'],
};
