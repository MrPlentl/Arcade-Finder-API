import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	const csvFilePath = path.resolve(__dirname, "data", "contact_info.csv");

	if (!fs.existsSync(csvFilePath)) {
		console.warn(`⚠️ Contact Info seed file not found at ${csvFilePath}`);
		return;
	}

	const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

	// Parsing headerless CSV with 6 fields:
	// venue_id, name, description, phone, email, website
	const records = parse(fileContent, {
		columns: false,
		skip_empty_lines: true,
		trim: true,
		cast: true,
	});

	const contactData = records.map((record) => {
		// Clean phone number: remove any non-digit characters
		const rawPhone = String(record[3] || "");
		const cleanedPhone = rawPhone.replace(/\D/g, "").substring(0, 10);

		return {
			venue_id: record[0],
			name: record[1],
			description: record[2],
			phone: cleanedPhone,
			email: record[4],
			website: record[5],
			created_at: new Date(),
		};
	});

	console.log(`🚀 Importing ${contactData.length} contact records...`);

	const chunkSize = 1000;
	for (let i = 0; i < contactData.length; i += chunkSize) {
		const chunk = contactData.slice(i, i + chunkSize);
		await queryInterface.bulkInsert("contact_info", chunk, {});
	}

	// Syncing sequence for contact_info_id_seq
	await queryInterface.sequelize.query(
		"SELECT setval('contact_info_id_seq', COALESCE((SELECT MAX(id) FROM contact_info), 1))",
	);
};

export const down = async (queryInterface) => {
	await queryInterface.bulkDelete("contact_info", null, {});
	await queryInterface.sequelize.query(
		"ALTER SEQUENCE contact_info_id_seq RESTART WITH 1",
	);
};
