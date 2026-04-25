import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	const csvFilePath = path.resolve(__dirname, "data", "location.csv");

	if (!fs.existsSync(csvFilePath)) {
		console.warn(`⚠️ Location seed file not found at ${csvFilePath}`);
		return;
	}

	const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

	// Parsing headerless CSV with 8 fields:
	// venue_id, street, city, state, zip, coordinates, plus_code, parking_type
	const records = parse(fileContent, {
		columns: false,
		skip_empty_lines: true,
		trim: true,
		cast: true,
	});

	const locationData = records.map((record) => ({
		venue_id: record[0], // Link to Venue
		street: record[1],
		city: record[2],
		state: record[3],
		zip: record[4], // Link to Zipcode
		coordinates: record[5],
		plus_code: record[6], // Manually added column
		parking_type: record[7], // Link to Parking Type
		created_at: new Date(),
	}));

	console.log(`🚀 Importing ${locationData.length} locations...`);

	const chunkSize = 1000;
	for (let i = 0; i < locationData.length; i += chunkSize) {
		const chunk = locationData.slice(i, i + chunkSize);
		await queryInterface.bulkInsert("location", chunk, {});
	}
};

export const down = async (queryInterface) => {
	await queryInterface.bulkDelete("location", null, {});
};
