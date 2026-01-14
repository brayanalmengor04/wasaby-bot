const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearall")
        .setDescription("Borra todos los mensajes 14 días o menos del canal")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const channel = interaction.channel;

        await interaction.reply({
            content: "Borrando mensajes...",
            flags: MessageFlags.Ephemeral
        });

        let totalDeleted = 0;

        while (true) {
            const messages = await channel.messages.fetch({ limit: 100 });
            if (messages.size === 0) break;

            const deletable = messages.filter(
                msg => Date.now() - msg.createdTimestamp < 1209600000
            );

            if (deletable.size === 0) break;

            const deleted = await channel.bulkDelete(deletable, true);
            totalDeleted += deleted.size;

            await new Promise(r => setTimeout(r, 1000));
        }

        await interaction.followUp({
            content: ` ${totalDeleted} mensajes borrados`,
            flags: MessageFlags.Ephemeral
        });
    }
};
