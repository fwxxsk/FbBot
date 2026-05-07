module.exports = {
  name: "ban",
  admin: true,

  execute: ({ args, data }) => {
    const user = args[0];
    if (!user) return console.log("Usage: ?ban <userID>");

    if (!data.bans.includes(user)) {
      data.bans.push(user);
    }

    console.log("⛔ Hoy bisaya, na-ban ka. Goodbye ka muna 😤 ID:", user);
  }
};
