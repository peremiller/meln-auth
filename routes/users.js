const UserModel = require('../models/User');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/', async (req,res)=>{
	let users = await UserModel.find().select('-password -email');
	res.send(users);
});

// router.get('/:id',async(req,res) =>{
// 	let users = await UserModel.findById(req.params.id);
// 	res.send(users);
// });

router.post('/', async(req,res)=>{
	if(!req.body.email) return res.status(400).send('Email is required');
	if(!req.body.password) return res.status(400).send('Password is required');
	let user = UserModel({
		name: req.body.name,
		email: req.body.email,
		isActive: true
});
	let salt = await bcrypt.genSalt(10);
	let hashed = await bcrypt.hash(req.body.password, salt);

	user.password = hashed;

	try{
		user = await user.save();
		res.send(user);
	}
	catch{
		res.status(400).send("Provided data is invalid. Please send a valid data.");
	}
});

router.put('/:id', async (req,res)=>{
	let user = await UserModel.findById(req.params.id);
	user.name = req.body.name;
	user.email = req.body.email;

	let salt = await bcrypt.genSalt(10);
	let hashed = await bcrypt.hash(req.body.password, salt);

	user.password = hashed;

	user = await user.save();
	res.send(user);

});

router.delete('/:id', async (req,res)=>{
	let user = await UserModel.findByIdAndRemove(req.params.id);

	res.send(user);
});

module.exports = router;
