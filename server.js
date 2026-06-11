const app = require('./app');
const config = require('./config');
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://root:admin1234@cluster0-ghl8c.mongodb.net/tutorials?retryWrites=true",{useNewUrlParser:true,useCreateIndex:true}).then(()=>{
	console.log("connected to db");
});

app.listen(config.port, ()=>{
	console.log(`listening on port ${config.port}`)
});