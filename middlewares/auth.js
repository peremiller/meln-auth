const config = require('../config');
const jwt = require('jsonwebtoken');

module.exports = function auth(req,res,next){
	const token = req.header('x-auth-token');
	if(!token) return res.status(401).send('Access denied. No token provided');

	try{
		let payload = jwt.verify(token, config.secret);
		req.user = payload;
		next();
	}
	catch(ex){
		res.status(400).send("Invalid token.")
	}
}
