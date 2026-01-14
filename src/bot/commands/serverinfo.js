const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('📊 Muestra información detallada del servidor'),

    async execute(interaction) {
        await interaction.deferReply();

        const { guild } = interaction;
        const { members, channels, roles, emojis } = guild;

        // Fetch owner and members to ensure accurate counts if needed (though .memberCount is usually enough)
        // Note: fetching all members might be expensive on large servers, relying on cache or properties is safer for general info
        const owner = await guild.fetchOwner();

        // Counts
        const totalMembers = guild.memberCount;
        const botCount = members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount; // Approximation if cache isn't full, but acceptable for basic info or utilize detailed fetch if needed. 
        // Better to just use totalMembers for speed unless requested distinction. 
        // Let's stick to total members + breakdown if possible from cache, or just Total.

        // Channel Counts
        const totalChannels = channels.cache.size;
        const textChannels = channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        // Dates
        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);

        // Verification Level Mapping
        const verificationLevels = {
            0: 'Ninguno',
            1: 'Bajo',
            2: 'Medio',
            3: 'Alto',
            4: 'Muy Alto'
        };

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Información de ${guild.name}`,
                iconURL: guild.iconURL({ dynamic: true })
            })
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .setColor('#2b2d31') // Dark premium color
            .setDescription(`**Dueño:** ${owner} (\`${owner.id}\`)\n**ID:** \`${guild.id}\`\n**Descripción:** ${guild.description || 'Sin descripción'}`)
            .addFields(
                {
                    name: '👥 Miembros',
                    value: `**Total:** ${totalMembers}\n**Humanos:** ${humanCount || 'N/A'}\n**Bots:** ${botCount || 'N/A'}`,
                    inline: true
                },
                {
                    name: '💬 Canales',
                    value: `**Total:** ${totalChannels}\n**Texto:** ${textChannels} | **Voz:** ${voiceChannels}\n**Categorías:** ${categories}`,
                    inline: true
                },
                {
                    name: '🚀 Mejoras',
                    value: `**Nivel:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount || 0}`,
                    inline: true
                },
                {
                    name: '🎨 Recursos',
                    value: `**Roles:** ${roles.cache.size}\n**Emojis:** ${emojis.cache.size}\n**Stickers:** ${guild.stickers.cache.size}`,
                    inline: true
                },
                {
                    name: '🛡️ Seguridad',
                    value: `**Verificación:** ${verificationLevels[guild.verificationLevel]}`,
                    inline: true
                },
                {
                    name: ' Creación',
                    value: `<t:${createdTimestamp}:R> (<t:${createdTimestamp}:D>)`,
                    inline: true
                }
            )
            .setFooter({ text: 'wasaby-bot • Información del Servidor', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
