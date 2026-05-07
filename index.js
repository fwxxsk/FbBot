const express = require("express");
const fs = require("fs");
const data = require("./data");

const app = express();
app.use(express.json());

console.log("[BOT] Render-ready bot starting...");

const prefix = data.prefix;
const commands = new Map();

// load commands
function loadCommands() {
  const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

  for (const file of files) {
    const cmd = require();
    commands.set(cmd.name, cmd);
  }

  console.log();
}

// 🔥 CORE BOT ENGINE
function handleMessage(senderID, msg) {
  const db = data.db;

  // ban check
  if (db.bans.includes(senderID)) {
    return { reply: "⛔ You are banned." };
  }

  // anti spam (simple safe version)
  if (!db.spam[senderID]) db.spam[senderID] = { last: "", count: 0 };

  const user = db.spam[senderID];

  if (msg === user.last) {
    db.warns[senderID] = (db.warns[senderID] || 0) + 1;
  }

  user.last = msg;
  data.saveDB(db);

  // command system
  if (!msg.startsWith(prefix)) return { reply: null };

  const args = msg.slice(prefix.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();

  const cmd = commands.get(name);
  if (!cmd) return { reply: "Unknown command" };

  if (cmd.admin && !data.isAdmin(senderID)) {
    return { reply: "❌ Admin only" };
  }

  return { reply: cmd.execute({ args, senderID, data: db }) || "Done." };
}

// 🌐 API ROUTE (this is what Render will use)
app.post("/message", (req, res) => {
  const { senderID, message } = req.body;

  const result = handleMessage(senderID, message);

  res.json(result);
});

// health check
app.get("/", (req, res) => {
  res.send("Bot is running ✔");
});

loadCommands();

app.listen(3000, () => {
  console.log("[BOT] Server running on port 3000");
});
