module.exports = {
  name: "unban",
  admin: true,

  execute: ({ args, data }) => {
    const user = args[0];
    if (!user) return console.log("Usage: ?unban <userID>");

    data.bans = data.bans.filter(id => id !== user);

    console.log("✅ Unban successful. Pwede ka na ulit 😌 ID:", user);
  }
};
