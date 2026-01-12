const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Responde con Pong y la latencia"),

    async execute(interaction) {
        await interaction.reply(`Hola Soy Wasaby !Te respondo Pong! Latencia es de : ${interaction.client.ws.ping}ms`);
    },
};
