import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	const csvFilePath = path.resolve(__dirname, "data", "movies.csv");

	if (!fs.existsSync(csvFilePath)) {
		console.warn(`⚠️ Movies seed file not found at ${csvFilePath}`);
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
	// [0] name, [1] year, [2] link_imdb, [3] link_letterboxd, [4] link_justwatch
	const movieData = records.map((record) => ({
		name: record[0],
		year: record[1] || null,
		link_imdb: record[2] || null,
		link_letterboxd: record[3] || null,
		link_justwatch: record[4] || null,
	}));

	// Bulk insert without IDs so the DB generates them automatically
	await queryInterface.bulkInsert("movie", movieData, {});
};

export const down = async (queryInterface) => {
	await queryInterface.bulkDelete("movie", null, {});
};
