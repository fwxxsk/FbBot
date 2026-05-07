const fs = require("fs");
const path = require("path");
const login = require("fca-unofficial");
const express = require("express");
const data = require("./data");

console.log("[BOT] Render-ready bot starting...");

const commands = new Map();
const prefix = data.prefix;

// --- SAFE COMMAND LOADER ---
function loadCommands() {
    const commandsPath = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsPath)) return console.log("[ERROR] Commands folder missing");
    
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of files) {
        try {
            const cmd = require(`./commands/${file}`);
            if (!cmd || !cmd.name) {
                console.log(`[SKIP] Invalid command file: ${file}`);
                continue;
            }
            commands.set(cmd.name, cmd);
        } catch (err) {
            console.log(`[ERROR loading command ${file}]:`, err.message);
        }
    }
    console.log(`[SYSTEM] Loaded ${commands.size} commands`);
}

// --- CORE HANDLER ---
function handleMessage(api, event) {
    const msg = event.body;
    const senderID = event.senderID;
    const db = data.db;

    if (!msg || !msg.startsWith(prefix)) return;
    if (db.bans && db.bans.includes(senderID)) return;

    const args = msg.slice(prefix.length).trim().split(/ +/);
    const name = args.shift().toLowerCase();
    const cmd = commands.get(name);

    if (!cmd) return;

    if (cmd.admin && !data.isAdmin(senderID)) {
        return api.sendMessage("You don't have permission to use this command.", event.threadID);
    }

    try {
        cmd.execute(api, event, args);
    } catch (error) {
        console.error(`[EXECUTION ERROR]:`, error);
        api.sendMessage("There was an error executing that command.", event.threadID);
    }
}

// --- ROUTE SERVER ---
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Bot is running ✓");
});

// --- MESSENGER LOGIN ---
const appStatePath = path.join(__dirname, 'appstate.json');

if (fs.existsSync(appStatePath)) {
    const appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));

    login({ appState }, (err, api) => {
        if (err) return console.error("[ERROR] Messenger Login Failed:", err);

        console.log("[BOT] Successfully connected to Messenger!");
        api.setOptions({ listenEvents: true, online: true, selfListen: false });

        api.listenMqtt((err, event) => {
            if (err) return;
            if (event.type === "message" || event.type === "message_reply") {
                handleMessage(api, event);
            }
        });
    });
} else {
    console.log("[WARN] appstate.json not found. Waiting for file...");
}

loadCommands();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[BOT] Live on port ${PORT}`);
});
