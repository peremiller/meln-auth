const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: String,
	email: {
		type:String,
		required:true,
		unique:true
	},
	isActive: Boolean,
	password: {
		type:String,
		required:true
	},
	isAdmin: Boolean
});

module.exports = mongoose.model('User',UserSchema);
