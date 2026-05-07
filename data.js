const fs = require("fs");

const dbPath = "./moderation.json";

function loadDB() {
  let db = {
    bans: [],
    warns: {},
    spam: {}
  };

  if (fs.existsSync(dbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(dbPath));
    } catch (e) {
      console.log("[DB] Corrupted, resetting...");
    }
  }

  // FORCE FIX missing fields
  if (!db.spam) db.spam = {};
  if (!db.warns) db.warns = {};
  if (!db.bans) db.bans = [];

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  return db;
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
  prefix: "?",
  admins: ["61577300994025"],

  db: loadDB(),
  saveDB,

  isAdmin(id) {
    return this.admins.includes(id);
  }
};
