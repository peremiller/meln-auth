const configuredPort = Number.parseInt(process.env.PORT || '3000', 10);

module.exports = {
  port: Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort < 65536 ? configuredPort : 3000,
  // The fallback is only for isolated Jest tests. A running server requires JWT_SECRET.
  secret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'jest-fixture-only-not-for-production' : undefined)
};
