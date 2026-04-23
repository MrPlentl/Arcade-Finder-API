/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
	development: {
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOSTNAME,
		dialect: process.env.DB_CONNECTION,
		port: process.env.DB_PORT,
		dialectOptions: {
			ssl:
				process.env.DB_SSL === "true"
					? { require: true, rejectUnauthorized: false }
					: false,
		},
	},
};
