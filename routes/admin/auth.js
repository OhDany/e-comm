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
		check('email').trim().normalizeEmail().isEmail().withMessage('Must be a valid email').custom(async (email) => {
			const existingUser = await usersRepo.getOneBy({ email });
			if (existingUser) {
				throw new Error('Email in use');
			}
		}),
		check('password').trim().isLength({ min: 4, max: 20 }).withMessage('Must be between 4 and 20 characters'),
		check('passwordValidation')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Must be between 4 and 20 characters')
			.custom(async (passwordConfirmation, { req }) => {
				if (passwordConfirmation !== req.body.password) {
					throw new Error('Password must match');
				}
			})
	],
	async (req, res) => {
		const errors = validationResult(req);
		console.log(errors);

		const { email, password, passwordConfirmation } = req.body;
		const user = await usersRepo.create({ email, password });

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
