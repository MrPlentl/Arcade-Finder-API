import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	const csvFilePath = path.resolve(__dirname, "data", "venue.csv");

	if (!fs.existsSync(csvFilePath)) {
		console.warn(`⚠️ Venue seed file not found at ${csvFilePath}`);
		return;
	}

	const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

	const records = parse(fileContent, {
		columns: false,
		skip_empty_lines: true,
		trim: true,
		cast: true,
	});

	const venueData = records.map((record) => ({
		id: record[0],
		name: record[1],
		type: record[2] || 1,
		status: 1,
		verified: false,
		created_at: new Date(),
	}));

	// 1. Perform the bulk insert
	await queryInterface.bulkInsert("venue", venueData, {});

	// 2. Reset the sequence so future auto-increments work correctly
	console.log("🔄 Resetting venue_id_seq counter...");
	await queryInterface.sequelize.query(
		"SELECT setval('venue_id_seq', (SELECT MAX(id) FROM venue))",
	);
};

export const down = async (queryInterface) => {
	await queryInterface.bulkDelete("venue", null, {});
	// Optional: Reset sequence to 1 when rolling back
	await queryInterface.sequelize.query(
		"ALTER SEQUENCE venue_id_seq RESTART WITH 1",
	);
};
