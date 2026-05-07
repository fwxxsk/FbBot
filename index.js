const fs = require("fs");
const data = require("./data");

console.log("[BOT] Render-ready bot starting...");

const commands = new Map();
const prefix = data.prefix;

// SAFE COMMAND LOADER 🔥
function loadCommands() {
  const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const cmd = require(`./commands/${file}`);

      // SAFETY CHECK (THIS FIXES YOUR CRASH)
      if (!cmd || !cmd.name) {
        console.log("[SKIP] Invalid command file:", file);
        continue;
      }

      commands.set(cmd.name, cmd);

    } catch (err) {
      console.log("[ERROR loading command]", file, err.message);
    }
  }

  console.log(`[SYSTEM] Loaded ${commands.size} commands`);
}

// CORE HANDLER (unchanged)
function handleMessage(senderID, msg) {
  const db = data.db;

  if (db.bans.includes(senderID)) return;

  if (!msg.startsWith(prefix)) return;

  const args = msg.slice(prefix.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();

  const cmd = commands.get(name);
  if (!cmd) return;

  if (cmd.admin && !data.isAdmin(senderID)) {
    return;
  }

  const result = cmd.execute({ args, senderID, data: db });

  return result;
}

// ROUTE SERVER
const express = require("express");
const app = express();

app.use(express.json());

app.post("/message", (req, res) => {
  const { senderID, message } = req.body;

  const reply = handleMessage(senderID, message);

  res.json({ reply: reply || null });
});

app.get("/", (req, res) => {
  res.send("Bot is running ✔");
});

loadCommands();

app.listen(3000, () => {
  console.log("[BOT] Live on port 3000");
});
