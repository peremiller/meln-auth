const auth = require('./routes/auth');
const users = require('./routes/users');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/api/auth', auth);
app.use('/api/users', users);

module.exports = app;
