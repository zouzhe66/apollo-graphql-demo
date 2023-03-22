import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { Low, JSONFile } from "lowdb";

// File path
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "../data/data.json");
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(
    dataPath,
    JSON.stringify({ books: [], authors: [], bookAuthorRelation: [] })
  );
}

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(dataPath);
const db = new Low(adapter);

export default db;
