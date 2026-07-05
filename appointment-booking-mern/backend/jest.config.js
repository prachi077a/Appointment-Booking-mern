module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/jest.setup.js"],
  // mongodb-memory-server downloads a mongod binary on first run - give it room
  testTimeout: 30000,
};
