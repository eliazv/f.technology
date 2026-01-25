export default {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/backend',
  moduleNameMapper: {
    '^@ftechnology/shared$': '<rootDir>/../../libs/shared/src/index.ts',
    '^@ftechnology/shared/(.*)$': '<rootDir>/../../libs/shared/src/$1',
  },
};
