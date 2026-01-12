const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { token, clientId, guildId } = require("./bot/config/config");

const commands = [];
const commandsPath = path.join(__dirname, "bot/commands");

for (const file of fs.readdirSync(commandsPath)) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
}
const rest = new REST({ version: "10" }).setToken(token);
(async () => {
    await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
    );
    console.log(" Comandos registrados");
})();
