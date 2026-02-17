module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "@/tests/(.*)": "<rootDir>/tests/$1",
    "@/(.*)": "<rootDir>/src/$1",
  },
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/src"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/main/**",
    "!<rootDir>/src/loaders/**",
  ],
  coverageProvider: "babel",
  transform: {
    ".+\\.ts$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  testTimeout: 60000,
};
