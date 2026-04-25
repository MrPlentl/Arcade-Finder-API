import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	// List of tables and their corresponding CSV filenames in the seeders directory
	const distanceConfigs = [
		{ table: "zipdistance05", file: "zipdistance05.csv" },
		{ table: "zipdistance25", file: "zipdistance25.csv" },
	];

	for (const config of distanceConfigs) {
		const csvFilePath = path.resolve(__dirname, "data", config.file);

		// Skip if the specific file doesn't exist to avoid breaking the whole seeder
		if (!fs.existsSync(csvFilePath)) {
			console.warn(
				`⚠️ Skipping ${config.table}: File ${config.file} not found.`,
			);
			continue;
		}

		const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

		// Parse headerless 3-column CSV
		const records = parse(fileContent, {
			columns: false,
			skip_empty_lines: true,
			trim: true,
			cast: true,
		});

		// Map to your table schema: origin (int), distance (numeric), destination (int)
		const distanceData = records.map((record) => ({
			origin: record[0], // First field
			distance: record[1], // Second field
			destination: record[2], // Third field
		}));

		console.log(
			`🚀 Importing ${distanceData.length} records into ${config.table}...`,
		);

		// Chunking to handle large datasets (standard for zip matrices)
		const chunkSize = 5000;
		for (let i = 0; i < distanceData.length; i += chunkSize) {
			const chunk = distanceData.slice(i, i + chunkSize);
			await queryInterface.bulkInsert(config.table, chunk, {});
		}
	}
};

export const down = async (queryInterface) => {
	// Cleanup all four tables
	await queryInterface.bulkDelete("zipdistance05", null, {});
	await queryInterface.bulkDelete("zipdistance25", null, {});
	await queryInterface.bulkDelete("zipdistance50", null, {});
	await queryInterface.bulkDelete("zipdistance100", null, {});
};
