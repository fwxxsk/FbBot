module.exports = {
  name: "admincmd",
  admin: true,

  execute: (args, senderID) => {
    console.log("🔐 Admin command executed by:", senderID);
  }
};
