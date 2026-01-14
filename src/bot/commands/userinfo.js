const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('🛡️ Muestra la identidad y insignias de un usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario del que quieres ver la información')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        // --- Badge Logic ---
        const badges = [];
        const userFlags = targetUser.flags?.toArray() || [];

        // Discord Badges
        if (userFlags.includes('Staff')) badges.push('<:staff:1018363915991785483> Staff'); // Replace ID if you have one, or use generic
        if (userFlags.includes('Partner')) badges.push('♾️ Partner');
        if (userFlags.includes('HypeSquad')) badges.push('✨ HypeSquad Events');
        if (userFlags.includes('HypeSquadOnlineHouse1')) badges.push('🛡️ Bravery');
        if (userFlags.includes('HypeSquadOnlineHouse2')) badges.push('⚖️ Brilliance');
        if (userFlags.includes('HypeSquadOnlineHouse3')) badges.push('🔮 Balance');
        if (userFlags.includes('BugHunterLevel1')) badges.push('🐛 Bug Hunter I');
        if (userFlags.includes('BugHunterLevel2')) badges.push('🐛 Bug Hunter II');
        if (userFlags.includes('ActiveDeveloper')) badges.push('💻 Active Dev');
        if (userFlags.includes('VerifiedDeveloper')) badges.push('💻 Verified Dev');
        if (userFlags.includes('PremiumEarlySupporter')) badges.push('💎 Early Supporter');

        // Server Badges (Permissions/Roles)
        if (member) {
            if (member.permissions.has('Administrator')) badges.push('👑 Admin');
            else if (member.permissions.has('ManageGuild')) badges.push('👮 Mod');

            if (member.premiumSince) badges.push('🚀 Server Booster');
        }

        // Fallback if empty
        if (badges.length === 0) badges.push('Usuario');

        // --- Dates ---
        const createdAt = Math.floor(targetUser.createdTimestamp / 1000);
        const joinedAt = member ? Math.floor(member.joinedTimestamp / 1000) : null;

        // --- Roles ---
        let rolesStr = 'No está en el servidor';
        let topRoleColor = '#2b2d31'; // Default dark gray

        if (member) {
            // Get roles excluding @everyone, sorted by position
            const roles = member.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position);

            rolesStr = roles.size > 0
                ? roles.map(r => r).slice(0, 5).join(', ') + (roles.size > 5 ? ` y ${roles.size - 5} más` : '')
                : 'Sin roles';

            topRoleColor = member.displayHexColor !== '#000000' ? member.displayHexColor : '#2b2d31';
        }

        // --- Embed Construction ---
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Identidad de ${targetUser.tag}`,
                iconURL: targetUser.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(topRoleColor)
            .setDescription(`${member ? `${member} \n` : ''}**ID:** \`${targetUser.id}\``)
            .addFields(
                {
                    name: '🎖️ Insignias',
                    value: badges.map(b => `\`${b.replace(/<:[^:]+:(\d+)>/, '')}\``).join(' • '), // Strip custom emoji IDs for cleaner text fallback if needed, or keep basic emojis
                    inline: false
                },
                {
                    name: '📅 Fechas',
                    value: `**Creado:** <t:${createdAt}:R> (<t:${createdAt}:D>)\n${joinedAt ? `**Unido:** <t:${joinedAt}:R> (<t:${joinedAt}:D>)` : '**Unido:** No está en el servidor'}`,
                    inline: false
                },
                {
                    name: `🎭 Roles (${member ? member.roles.cache.size - 1 : 0})`,
                    value: rolesStr,
                    inline: false
                }
            );

        if (targetUser.banner) {
            embed.setImage(targetUser.bannerURL({ dynamic: true, size: 1024 }));
        }

        embed.setFooter({ text: 'wasaby-bot • Sistema de Identidad', iconURL: interaction.client.user.displayAvatarURL() });
        embed.setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
