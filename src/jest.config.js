export default {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/config.js"
  ],
  coverageDirectory: "coverage",
};