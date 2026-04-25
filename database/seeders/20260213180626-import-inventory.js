import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CONFIGURATION: Add your CSV filenames here.
 * The seeder will loop through this array and process each file.
 */
const SEED_FILES = [
	"inventory-electricstarship.csv",
	"inventory-nvgm.csv",
	"inventory-timerift.csv",
	"inventory-tornado-terrys.csv",
	"inventory-fp-richardson.csv",
	"inventory-cidercade-ftw.csv",
	"inventory-pushstartplay.csv",
];

export const up = async (queryInterface) => {
	let allInventoryData = [];

	for (const fileName of SEED_FILES) {
		const csvFilePath = path.resolve(__dirname, "data", fileName);

		if (!fs.existsSync(csvFilePath)) {
			console.warn(`⚠️ Inventory seed file not found at ${csvFilePath}`);
			continue;
		}

		const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

		// Using csv-parse/sync to handle the heavy lifting
		const records = parse(fileContent, {
			columns: false,
			skip_empty_lines: true,
			trim: true,
			cast: true,
		});

		// Mapping based on your specific requirements:
		// 1: venue_id, 2: game_id, 3: type, 4: variant (Ignore others)
		const mappedRecords = records.map((record) => ({
			venue_id: record[0],
			game_id: record[1],
			type: record[2],
			variant: record[3],
			status: 1, // Hardcoded per your instructions
			created_at: new Date(),
			updated_at: new Date(),
		}));

		allInventoryData.push(...mappedRecords);
	}

	if (allInventoryData.length === 0) {
		console.log("Empty inventory set. Nothing to import.");
		return;
	}

	console.log(
		`🚀 Importing ${allInventoryData.length} inventory items from ${SEED_FILES.length} files...`,
	);

	const chunkSize = 1000;
	for (let i = 0; i < allInventoryData.length; i += chunkSize) {
		const chunk = allInventoryData.slice(i, i + chunkSize);
		// Assuming your table name is "inventory"
		await queryInterface.bulkInsert("inventory", chunk, {});
	}
};

export const down = async (queryInterface) => {
	// Caution: This clears the entire table.
	await queryInterface.bulkDelete("inventory", null, {});
};
