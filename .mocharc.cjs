module.exports = {
  extensions: [
    'ts'
  ],
  require: ["tsx", require.resolve("./mocha-setup.js")],
  spec: "test/**/*.test.ts",
}
