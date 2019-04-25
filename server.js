const config = require('./config');
const users = require('./routes/users');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://root:admin1234@cluster0-ghl8c.mongodb.net/tutorials?retryWrites=true",{useNewUrlParser:true,useCreateIndex:true}).then(()=>{
	console.log("connected to db");
});

app.use(express.json());

app.use('/api/users', users);

app.listen(config.port, ()=>{
	console.log(`listening on port ${config.port}`)
});