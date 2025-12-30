import fs from "fs";
import path from "path";

const DB_PATH = path.resolve("database.json");

const DEFAULT_DB = {
  users: {}
};

export function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    console.log("cannot find database.json");

    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(DEFAULT_DB, null, 2)
    );

    console.log("successfully create database.json");
    return DEFAULT_DB;
  }

  console.log("success load from database.json");
  return readDB();
}

export function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("failed to read database.json", err);
    return DEFAULT_DB;
  }
}

export function writeDB(data) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(data, null, 2)
  );
}