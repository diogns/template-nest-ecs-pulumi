// eslint-disable-next-line @typescript-eslint/no-var-requires
const coverageThreshold = require('./jest.config.base');

module.exports = {
  verbose: true,
  collectCoverageFrom: ['src/user/interfaces/**/*.(t|j)s'],
  coverageDirectory: 'reports/coverage-result/e2e',
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '@user/application/(.*)': '<rootDir>/src/user/application/$1',
    '@user/domain/(.*)': '<rootDir>/src/user/domain/$1',
    '@user/infrastructure/(.*)': '<rootDir>/src/user/infrastructure/$1',
    '@user/interfaces/(.*)': '<rootDir>/src/user/interfaces/$1',
    '@helpers/(.*)': '<rootDir>/src/helpers/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  coverageThreshold: coverageThreshold,
  reporters: [
    'default',
    [
      'jest-stare',
      {
        log: false,
        resultDir: 'reports/test-result/e2e',
        reportSummary: false,
        reportTitle: 'E2E Testing Results',
        reportHeadline: 'E2E Testing Results',
        additionalResultsProcessors: ['jest-junit'],
        coverageLink: '../../coverage-result/e2e/lcov-report/index.html',
        jestStareConfigJson: 'jest-stare.json',
        jestGlobalConfigJson: 'globalStuff.json',
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: 'reports/test-result/junit',
        outputName: 'e2e.xml',
      },
    ],
  ],
  testRegex: '.*\\.e2e\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: false,
      },
    ],
  },
  testEnvironment: 'node',
};
