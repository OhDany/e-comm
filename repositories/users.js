const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UserRepository extends Repository {
	async comparePasswords(saved, supplied) {
		// const result = saved.split('.');
		// const hashed = result[0]; // Is the same
		// const salt = result[1];
		const [ hashed, salt ] = saved.split('.');
		const hashedSupliedBuf = await scrypt(supplied, salt, 64);

		return hashed === hashedSupliedBuf.toString('hex');
	}

	async create(attrs) {
		attrs.id = this.randomId();

		const salt = crypto.randomBytes(8).toString('hex');
		const buf = await scrypt(attrs.password, salt, 64);

		const records = await this.getAll();
		const record = {
			...attrs,
			password: `${buf.toString('hex')}.${salt}`
		};

		records.push(record);

		await this.writeAll(records);

		return record;
	}
}

module.exports = new UserRepository('users.json');
