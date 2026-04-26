import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const up = async (queryInterface) => {
  const csvFilePath = path.resolve(__dirname, 'data', 'zipcodes.csv');

  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`Seed file not found at ${csvFilePath}`);
  }

  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  // Since there is no header, we set columns: false
  // This returns each row as an array: [ [1001], [1002], ... ]
  const records = parse(fileContent, {
    columns: false,
    skip_empty_lines: true,
    trim: true,
    cast: true,
  });

  // Manually map the first element of each row to the 'id' field
  const zipData = records.map((record) => {
    return {
      id: record[0], // The integer from your single column
      country: 'US', // Hardcoded default
    };
  });

  const chunkSize = 1000;
  for (let i = 0; i < zipData.length; i += chunkSize) {
    const chunk = zipData.slice(i, i + chunkSize);
    // Ensure table name 'zipcode' matches your migration exactly
    await queryInterface.bulkInsert('zipcode', chunk, {});
  }
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('zipcode', null, {});
};
