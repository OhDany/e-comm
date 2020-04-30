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
}

const repo = new UserRepository('user.json');
