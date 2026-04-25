import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES6 workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
	const csvPath = path.join(__dirname, "./data/top_rated_games.csv");

	if (!fs.existsSync(csvPath)) {
		console.error(
			`Could not find CSV file at ${csvPath}. Skipping seeder.`,
		);
		return;
	}

	const rawData = fs.readFileSync(csvPath, "utf8");

	const rows = rawData.split(/\r?\n/).filter((row) => row.trim() !== "");
	rows.shift();

	const parsedCsvData = rows.map((row) => {
		const [igdb_id, total_rating, total_rating_count] = row.split(",");
		return {
			igdb_id: parseInt(igdb_id, 10),
			total_rating: parseFloat(total_rating),
			total_rating_count: parseInt(total_rating_count, 10),
		};
	});

	const igdbIds = parsedCsvData.map((data) => data.igdb_id);

	if (igdbIds.length === 0) {
		console.log("CSV is empty. Nothing to seed.");
		return;
	}

	const [gamesFromDb] = await queryInterface.sequelize.query(
		`SELECT id, igdb_id FROM game WHERE igdb_id IN (${igdbIds.join(",")})`,
	);

	const gameIdMap = {};
	gamesFromDb.forEach((game) => {
		gameIdMap[game.igdb_id] = game.id;
	});

	// Arrays to hold our bulk insert data
	const ratingsInsertData = [];
	const viewsInsertData = [];

	parsedCsvData.forEach((data) => {
		const internalGameId = gameIdMap[data.igdb_id];

		if (internalGameId) {
			// 1. Prepare the game_ratings record
			ratingsInsertData.push({
				game_id: internalGameId,
				total_rating: data.total_rating,
				total_rating_count: data.total_rating_count,
			});

			// 2. Calculate views and prepare the game_views records
			const viewsToCreate = Math.ceil(data.total_rating_count / 10);

			for (let i = 0; i < viewsToCreate; i++) {
				viewsInsertData.push({
					game_id: internalGameId,
				});
			}
		} else {
			console.warn(
				`Game with igdb_id ${data.igdb_id} was not found in the game table. Skipping ratings and views.`,
			);
		}
	});

	// 3. Execute bulk inserts
	if (ratingsInsertData.length > 0) {
		await queryInterface.bulkInsert("game_ratings", ratingsInsertData, {});
		console.log(`🚀 Importing ${ratingsInsertData.length} ratings.`);
	} else {
		console.log("No matching game found. Inserted 0 ratings.");
	}

	if (viewsInsertData.length > 0) {
		await queryInterface.bulkInsert("game_views", viewsInsertData, {});
		console.log(`🚀 Importing ${viewsInsertData.length} views.`);
	} else {
		console.log("No matching game found. Inserted 0 views.");
	}
};

export const down = async (queryInterface) => {
	// Revert the seed by deleting everything from both tables
	// It's usually best to delete child table data (views) before parent table data (if relations exist)
	await queryInterface.bulkDelete("game_views", null, {});
	await queryInterface.bulkDelete("game_ratings", null, {});
};
