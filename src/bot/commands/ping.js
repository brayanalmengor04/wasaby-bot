const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { color } = require("../config/config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Responde con Pong y la latencia"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle("🏓 Pong!")
            .setDescription(`¡Hola! Soy Wasaby. La latencia es de: **${interaction.client.ws.ping}ms**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
