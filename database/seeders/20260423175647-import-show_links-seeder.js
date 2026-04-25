import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	const csvFilePath = path.resolve(__dirname, "data", "show_links.csv");

	if (!fs.existsSync(csvFilePath)) {
		console.warn(`⚠️ Show_links seed file not found at ${csvFilePath}`);
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
	// [0] show_id, [1] game_id
	const showLinkData = records.map((record) => ({
		show_id: record[0],
		game_id: record[1] || null,
	}));

	// Bulk insert without IDs so the DB generates them automatically
	await queryInterface.bulkInsert("show_links", showLinkData, {});
};

export const down = async (queryInterface) => {
	await queryInterface.bulkDelete("show_links", null, {});
};
