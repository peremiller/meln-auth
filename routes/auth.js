const config = require('../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/User');
const express = require('express');
const router = express.Router();

router.post('/', async (req,res) => {
	let user = await UserModel.findOne({email:req.body.email});

	if(!user) return res.status(400).send('Email or Password is incorrect');

	let matched = await bcrypt.compare(req.body.password, user.password);
	if(!matched) return res.status(400).send('Email or Password is incorrect');

	const token = jwt.sign({ _id: user._id, name: user.name }, config.secret);

	res.header('x-auth-token',token).send(user);
});

module.exports = router;