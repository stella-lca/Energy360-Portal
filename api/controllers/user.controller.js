const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
	User: { findByID, findUser, createUser, deleteUser }
} = require("../models");

const { APPSETTING_JWT_SECRET, APPSETTING_JWT_EXPIRED } = process.env;

const createJwtToken = async user => {
	const payload = {
		userId: user.id,
		email: user.email
	};

	return await jwt.sign(payload, APPSETTING_JWT_SECRET, {
		expiresIn: APPSETTING_JWT_EXPIRED
	});
};

// User Signup
exports.signup = async (req, res) => {
	const {
		body: params,
		body: { email, password }
	} = req;

	// Request Params Validation
	if (!email && password) {
		return res.status(202).send({
			message: "User Email or Password can not be empty!"
		});
	}

	// Check User already exist and create new user!
	let user = await findUser(email);
	if (user !== undefined) {
		return res.status(202).send({ message: "User already Exist!" });
	} else {
		user = await createUser({
			...params,
			password: bcrypt.hashSync(password, 8)
		});
		if (user !== undefined) {
			delete user.password;
			const token = await createJwtToken(user);
			res.status(200).send({ user, token });
		} else {
			res.status(500).send({ message: err.message });
		}
	}
};

// User Signin
exports.signin = async (req, res) => {
	const { email, password } = req.query;

	let user = await findUser(email);
	if (user !== undefined) {
		// Password Validation
		const passwordIsValid = bcrypt.compareSync(password, user.password);
		if (!passwordIsValid) {
			return res.status(202).send({
				message: "Password is wrong!"
			});
		}

		delete user.password;
		const token = await createJwtToken(user);

		res.status(200).send({ token, user });
	} else {
		return res.status(202).send({ message: "User Not found." });
	}
};

// Find a single User with an id
exports.findOne = async (req, res) => {
	const { id } = req.params;
	let user = await findByID(id);
	if (user !== undefined) {
		delete user.password;
		return res.send({ user });
	} else {
		return res.status(404).send({ message: "User Not found." });
	}
};

// Delete a User with the specified id in the request
exports.delete = async (req, res) => {
	const { id } = req.params;

	if (await deleteUser(id)) {
		return res.send({
			message: "User was deleted successfully!"
		});
	} else {
		res.send({
			message: `Cannot delete User with id=${id}. Maybe User was not found!`
		});
	}
};

// Check token validation
exports.checkToken = async (req, res) => {
	const { id } = req.user;
	let user = await findByID(id);
	if (user !== undefined) {
		delete user.password;
		return res.send({ user });
	} else {
		return res.status(404).send({ message: "User Not found." });
	}
};
