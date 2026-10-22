module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setup.js"],
  transform: {},
  maxWorkers: 1,
  clearMocks: true,
  verbose: true,
};
