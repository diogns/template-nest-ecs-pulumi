// eslint-disable-next-line @typescript-eslint/no-var-requires
const coverageThreshold = require('./jest.config.base.js');

module.exports = {
  collectCoverageFrom: [
    'src/user/application/**/*.(t|j)s',
    'src/user/domain/**/*.(t|j)s',
  ],
  coverageDirectory: 'reports/coverage-result/unit',
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '@user/application/(.*)': '<rootDir>/src/user/application/$1',
    '@user/domain/(.*)': '<rootDir>/src/user/domain/$1',
    '@user/infrastructure/(.*)': '<rootDir>/src/user/infrastructure/$1',
    '@user/interfaces/(.*)': '<rootDir>/src/user/interfaces/$1',
    '@helpers/(.*)': '<rootDir>/src/helpers/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  reporters: [
    'default',
    [
      'jest-stare',
      {
        log: false,
        resultDir: 'reports/test-result/unit',
        reportSummary: false,
        reportTitle: 'Unit Testing Results',
        reportHeadline: 'Unit Testing Results',
        additionalResultsProcessors: ['jest-junit'],
        coverageLink: '../../coverage-result/unit/lcov-report/index.html',
        jestStareConfigJson: 'jest-stare.json',
        jestGlobalConfigJson: 'globalStuff.json',
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: 'reports/test-result/junit',
        outputName: 'unit.xml',
      },
    ],
    [
      'jest-sonar',
      {
        outputDirectory: 'reports/test-result/jest-sonar',
        outputName: 'unit.xml',
      },
    ],
  ],
  rootDir: './',
  coverageThreshold: coverageThreshold,
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  verbose: true,
  testEnvironment: 'node',
};
