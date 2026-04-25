import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	const csvFilePath = path.resolve(__dirname, "data", "shows.csv");

	if (!fs.existsSync(csvFilePath)) {
		console.warn(`⚠️ Shows seed file not found at ${csvFilePath}`);
		return;
	}

	const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

	const records = parse(fileContent, {
		columns: false, // No headers in file
		skip_empty_lines: true,
		trim: true,
		cast: true,
	});

	// Mapping columns based on your SQL schema:
	// [0] name, [1] year, [2] link_letterboxd, [3] link_justwatch
	const showData = records.map((record) => ({
		name: record[0],
		year: record[1] || null,
		link_imdb: record[2] || null,
		link_justwatch: record[3] || null,
	}));

	// Bulk insert without IDs so the DB generates them automatically
	await queryInterface.bulkInsert("show", showData, {});
};

export const down = async (queryInterface) => {
	await queryInterface.bulkDelete("show", null, {});
};
