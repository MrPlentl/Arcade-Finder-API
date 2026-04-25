import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	async up(queryInterface) {
		// 1. Define file paths
		const gamesPath = path.join(__dirname, "data", "igdb-arcadelist.json");

		// 2. Read and parse data
		const gamesRaw = JSON.parse(fs.readFileSync(gamesPath, "utf-8"));

		// 3. Format the main games data
		const formattedGames = gamesRaw.map((game) => ({
			id: game.id,
			name: game.name,
			slug: game.slug,
			summary: game.summary,
			// Ensure the date is in YYYY-MM-DD format
			first_release_date: game.first_release_date
				? new Date(game.first_release_date * 1000)
						.toISOString()
						.split("T")[0]
				: null,
		}));

		// 4. Execute inserts (Order matters for Foreign Keys!)
		console.log(`🚀 Importing ${formattedGames.length} game aliases...`);
		await queryInterface.bulkInsert("igdb", formattedGames);
	},

	async down(queryInterface) {
		// Delete in reverse order to avoid FK constraint errors
		await queryInterface.bulkDelete("igdb", null, {});
	},
};
