import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "database.json");

export function readDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

export function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}