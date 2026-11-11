const app = require('./app');
const config = require('./config');
const mongoose = require('mongoose');

async function start() {
  // Fail closed: never open the HTTP listener without both required credentials.
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error('Missing MONGODB_URI or JWT_SECRET environment configuration; server not started.');
    process.exitCode = 1;
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useCreateIndex: true
    });
    app.listen(config.port, () => console.log(`listening on port ${config.port}`));
    return true;
  } catch {
    // Do not log the connection URL, credentials, or detailed server errors.
    console.error('Database connection failed; server not started.');
    process.exitCode = 1;
    return false;
  }
}

if (require.main === module) {
  start();
}

module.exports = { start };
