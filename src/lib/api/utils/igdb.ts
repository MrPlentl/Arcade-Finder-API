import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IGDB_STORAGE_DIR = join(__dirname, '../../../../storage/igdb');

export interface InventoryItem {
  igdb_id?: number | null;
  image_url?: string | null;
  cover_image?: string | null;
}

/**
 * Helper to attach IGDB info to a list of game items
 * @param items The array of inventory items to enrich with IGDB image info
 * @param onWarning Optional callback to handle warning messages
 */
export async function attachIgdbImageInfo(
  items: InventoryItem[],
  onWarning?: (msg: string) => void,
) {
  await Promise.all(
    items.map(async (item: InventoryItem) => {
      item.image_url = null;
      item.cover_image = null;

      if (item.igdb_id != null) {
        const idStr = String(item.igdb_id);
        const folder = idStr.padStart(2, '0').slice(-2);
        const filePath = join(IGDB_STORAGE_DIR, folder, `${idStr}.json`);

        try {
          const fileData = await readFile(filePath, 'utf-8');
          const igdbData = JSON.parse(fileData);
          if (igdbData?.cover?.url) {
            item.image_url = igdbData.cover.url;
            item.cover_image = igdbData.cover.url;
          }
        } catch (error: unknown) {
          if (onWarning) {
            onWarning(
              `Failed to read or parse IGDB file for ID ${idStr}: ${(error as Error).message}`,
            );
          }
        }
      }
    }),
  );
}
