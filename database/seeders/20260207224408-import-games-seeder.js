import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
  const csvFilePath = path.resolve(__dirname, 'data', 'games.csv');
  const aliasesPath = path.join(__dirname, 'data', 'game_aliases.json');

  if (!fs.existsSync(csvFilePath)) {
    console.warn(`⚠️ Games seed file not found at ${csvFilePath}`);
    return;
  }

  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Parsing headerless CSV with 4 fields: id, name, type, igdb_id
  const records = parse(fileContent, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
    cast: true,
  });

  // Mapping to match your database schema
  const gameData = records.map((record) => ({
    id: record[0], // The integer ID
    name: record[1], // The game name (e.g., "Computer Space")
    type: record[2] || 0, // The game_type ID (defaults to 0 "Unknown")
    igdb_id: record[3] || null, // The IGDB ID (defaults to null)
    created_at: new Date(),
  }));

  console.log(`🚀 Importing ${gameData.length} games...`);

  const chunkSize = 1000;
  for (let i = 0; i < gameData.length; i += chunkSize) {
    const chunk = gameData.slice(i, i + chunkSize);
    await queryInterface.bulkInsert('game', chunk, {});
  }

  // Add Aliases
  if (!fs.existsSync(aliasesPath)) {
    console.warn(`⚠️ Game aliases seed file not found at ${aliasesPath}`);
    return;
  }
  const aliasesRaw = JSON.parse(fs.readFileSync(aliasesPath, 'utf-8'));

  // Format the aliases data
  const formattedAliases = aliasesRaw.map((alias) => ({
    game_id: alias.game_id,
    name_variant: alias.name_variant,
  }));

  console.log(`Seeding ${formattedAliases.length} aliases...`);
  await queryInterface.bulkInsert('game_aliases', formattedAliases);
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('game_aliases', null, {});
  await queryInterface.bulkDelete('game', null, {});
};
