module.exports = {
  name: "warn",
  admin: true,

  execute: ({ args, data }) => {
    const user = args[0];
    if (!user) return console.log("Usage: ?warn <userID>");

    if (!data.warns[user]) data.warns[user] = 0;
    data.warns[user]++;

    const count = data.warns[user];

    console.log(
      "⚠️ Hoy bisaya, puro ka break ng rules 😤 Warning ka na. Count:",
      count
    );
  }
};
