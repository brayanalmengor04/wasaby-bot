require("dotenv").config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    color: process.env.BOT_COLOR || "#65137c",
};
