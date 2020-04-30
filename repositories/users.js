const fs = require('fs');

class UserRepository {
	constructor(filename) {
		if (!filename) {
			throw new Error('Creating a repository equires a filename');
		}

		this.filename = filename;
		try {
			fs.accessSync(this.filename);
		} catch (err) {
			fs.writeFileSync(this.filename, '[]');
		}
	}

	async getAll() {
		return JSON.parse(
			await fs.promises.readFile(this.filename, {
				encoding: 'utf8'
			})
		);
	}

	async create(attrs) {
		const rescords = await this.getAll();
		rescords.push(attrs);

		await fs.promises.writeFile(this.filename, JSON.stringify(rescords));
	}
}

const test = async () => {
	const repo = new UserRepository('user.json');

	await repo.create({ email: 'test@test.com', password: 'password' });

	const users = await repo.getAll();

	console.log(users);
};

test();
