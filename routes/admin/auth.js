const express = require('express');
const { check, validationResult } = require('express-validator');

const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const siginTempalte = require('../../views/admin/auth/signin');

const router = express.Router();

router.get('/signup', (req, res) => {
	res.send(signupTemplate({ req }));
});

router.post(
	'/signup',
	[
		check('email').trim().normalizeEmail().isEmail(),
		check('password').trim().isLength({ min: 4, max: 20 }),
		check('passwordValidation').trim().isLength({ min: 4, max: 20 })
	],
	async (req, res) => {
		const errors = validationResult(req);
		console.log(errors);

		const { email, password, passwordConfirmation } = req.body;

		const existingUser = await usersRepo.getOneBy({ email });
		if (existingUser) {
			return res.send('Email in use');
		}

		if (password !== passwordConfirmation) {
			return res.send('Password mus match');
		}

		// Create a user in our user repo to represent this person
		const user = await usersRepo.create({ email, password });

		// Store the id of tahat inside the users cookie
		req.session.userId = user.id;

		res.send('Accoun created!!!');
	}
);

router.get('/signout', (req, res) => {
	req.session = null;
	res.send('You are logged out');
});

router.get('/signin', (req, res) => {
	res.send(siginTempalte());
});

router.post('/signin', async (req, res) => {
	const { email, password } = req.body;

	const user = await usersRepo.getOneBy({ email });

	if (!user) {
		return res.send('email not found');
	}

	const validPassword = await usersRepo.comparePasswords(user.password, password);

	if (!validPassword) {
		return res.send('Invalid password');
	}

	req.session.userId = user.id;

	res.send('You are sigend in');
});

module.exports = router;
