const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const kazagumoManager = require('../managers/KazagumoManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('🎵 Sistema de música premium con Lavalink')
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('Reproduce una canción o playlist')
                .addStringOption(opt =>
                    opt.setName('cancion')
                        .setDescription('Nombre de la canción o URL')
                        .setRequired(true)
                        .setAutocomplete(true) // Enable autocomplete for real-time search
                )
        )
        .addSubcommand(sub =>
            sub.setName('stop')
                .setDescription('Detiene la música y desconecta el bot')
        )
        .addSubcommand(sub =>
            sub.setName('skip')
                .setDescription('Salta la canción actual')
        )
        .addSubcommand(sub =>
            sub.setName('pause')
                .setDescription('Pausa o reanuda la reproducción')
        )
        .addSubcommand(sub =>
            sub.setName('queue')
                .setDescription('Muestra la cola de reproducción')
        )
        .addSubcommand(sub =>
            sub.setName('volume')
                .setDescription('Ajusta el volumen de reproducción')
                .addIntegerOption(opt =>
                    opt.setName('nivel')
                        .setDescription('Nivel de volumen (0-200)')
                        .setMinValue(0)
                        .setMaxValue(200)
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('loop')
                .setDescription('Configura el modo de repetición')
                .addStringOption(opt =>
                    opt.setName('modo')
                        .setDescription('Modo de repetición')
                        .setRequired(true)
                        .addChoices(
                            { name: '❌ Desactivado', value: 'none' },
                            { name: '🔂 Repetir canción', value: 'track' },
                            { name: '🔁 Repetir cola', value: 'queue' }
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('shuffle')
                .setDescription('Mezcla la cola de reproducción')
        )
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Limpia la cola de reproducción')
        )
        .addSubcommand(sub =>
            sub.setName('nowplaying')
                .setDescription('Muestra la canción actual')
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const { member, guild, channel } = interaction;
        const voiceChannel = member.voice.channel;

        // Voice channel check (except for queue and nowplaying)
        if (!voiceChannel && !['queue', 'nowplaying'].includes(subcommand)) {
            return interaction.editReply('❌ Debes estar en un canal de voz para usar este comando.');
        }

        try {
            switch (subcommand) {
                case 'play': {
                    const query = interaction.options.getString('cancion');
                    const isUrl = /^https?:\/\//.test(query);

                    // If it's a URL, play directly
                    if (isUrl) {
                        await kazagumoManager.play(interaction, query);
                        return;
                    }

                    // Search mode - Show premium UI with selection
                    const searchResult = await kazagumoManager.search(query, { requester: interaction.user });

                    if (!searchResult || !searchResult.tracks || searchResult.tracks.length === 0) {
                        return interaction.editReply('❌ No se encontraron resultados para tu búsqueda.');
                    }

                    // If only one result, play it directly
                    if (searchResult.tracks.length === 1) {
                        await kazagumoManager.play(interaction, searchResult.tracks[0].uri);
                        return;
                    }

                    // Premium UI - Show top 10 results with select menu
                    const topTracks = searchResult.tracks.slice(0, 10);

                    const formatDuration = (ms) => {
                        if (!ms || ms === 0) return '🔴 LIVE';
                        const seconds = Math.floor(ms / 1000);
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };

                    // Custom emojis for visual appeal
                    const trackEmojis = ['🎵', '🎶', '🎸', '🎹', '🎤', '🎧', '🎺', '🎻', '🥁', '🎼'];

                    // Create stunning embed
                    const embed = new EmbedBuilder()
                        .setColor('#9b59b6')
                        .setAuthor({
                            name: '🔎 Resultados de Búsqueda',
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setTitle(`📝 ${topTracks.length} resultados encontrados`)
                        .setDescription(`**Búsqueda:** \`${query}\`\n\n*Selecciona una canción del menú desplegable:*`)
                        .addFields(
                            topTracks.map((track, i) => ({
                                name: `${trackEmojis[i]} ${track.title.substring(0, 60)}`,
                                value: `👤 **${track.author.substring(0, 35)}** • ⏱️ ${formatDuration(track.length)}`,
                                inline: false
                            }))
                        )
                        .setFooter({
                            text: `🎵 Solicitado por ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setTimestamp();

                    if (topTracks[0].thumbnail) {
                        embed.setThumbnail(topTracks[0].thumbnail);
                    }

                    // Create premium select menu
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('music_search_select')
                        .setPlaceholder('🎵 Selecciona una canción...')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(
                            topTracks.map((track, i) => ({
                                label: track.title.substring(0, 100),
                                description: `${track.author.substring(0, 50)} • ${formatDuration(track.length)}`,
                                value: track.uri,
                                emoji: trackEmojis[i]
                            }))
                        );

                    const row = new ActionRowBuilder().addComponents(selectMenu);

                    const response = await interaction.editReply({
                        embeds: [embed],
                        components: [row]
                    });

                    // Create collector for select menu interactions
                    const collector = response.createMessageComponentCollector({
                        componentType: ComponentType.StringSelect,
                        time: 60000 // 60 seconds
                    });

                    collector.on('collect', async (selectInteraction) => {
                        // Only allow the command user to interact
                        if (selectInteraction.user.id !== interaction.user.id) {
                            return selectInteraction.reply({
                                content: '❌ Solo quien solicitó la búsqueda puede seleccionar.',
                                ephemeral: true
                            });
                        }

                        // Get selected track
                        const selectedUri = selectInteraction.values[0];
                        const selectedTrack = topTracks.find(t => t.uri === selectedUri);

                        // Acknowledge the selection immediately
                        await selectInteraction.deferUpdate();

                        // Update the original message
                        await interaction.editReply({
                            content: `⏳ **Cargando:** ${selectedTrack.title}...`,
                            embeds: [],
                            components: []
                        });

                        // Play the selected track
                        await kazagumoManager.play(interaction, selectedUri);
                        collector.stop('selected');
                    });

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            interaction.editReply({
                                content: '⏰ **Tiempo de selección expirado.** Usa `/music play` nuevamente.',
                                embeds: [],
                                components: []
                            }).catch(() => { });
                        }
                    });
                    break;
                }

                case 'stop': {
                    if (kazagumoManager.stop(guild.id)) {
                        await interaction.editReply('🛑 **Música detenida.** ¡Hasta la próxima!');
                    } else {
                        await interaction.editReply('❌ No hay música reproduciéndose.');
                    }
                    break;
                }

                case 'skip': {
                    if (kazagumoManager.skip(guild.id)) {
                        await interaction.editReply('⏭️ **Canción saltada.** Reproduciendo siguiente...');
                    } else {
                        await interaction.editReply('❌ No hay canciones para saltar.');
                    }
                    break;
                }

                case 'pause': {
                    const paused = kazagumoManager.pause(guild.id);
                    if (paused === null) {
                        await interaction.editReply('❌ No hay música reproduciéndose.');
                    } else {
                        await interaction.editReply(paused ? '⏸️ **Música pausada.**' : '▶️ **Música reanudada.**');
                    }
                    break;
                }

                case 'queue': {
                    const player = kazagumoManager.getPlayer(guild.id);
                    if (!player || (!player.queue.current && player.queue.size === 0)) {
                        return interaction.editReply('📭 **La cola está vacía.** Usa `/music play` para agregar canciones.');
                    }

                    const current = player.queue.current;
                    const queue = player.queue;

                    const embed = new EmbedBuilder()
                        .setColor('#9b59b6')
                        .setAuthor({ name: '📜 Cola de Reproducción', iconURL: interaction.client.user.displayAvatarURL() })
                        .setThumbnail(current?.thumbnail || null);

                    if (current) {
                        embed.addFields({
                            name: '🔊 Reproduciendo Ahora',
                            value: `**[${current.title}](${current.uri})**\n👤 ${current.author} • 🎧 ${current.requester}`,
                            inline: false
                        });
                    }

                    if (queue.size > 0) {
                        const queueList = queue.map((track, i) => {
                            return `**${i + 1}.** [${track.title.substring(0, 50)}](${track.uri})\n   👤 ${track.author.substring(0, 30)}`;
                        }).slice(0, 10).join('\n\n');

                        embed.addFields({
                            name: `📝 Siguiente (${queue.size} en cola)`,
                            value: queueList + (queue.size > 10 ? `\n\n*...y ${queue.size - 10} más*` : ''),
                            inline: false
                        });
                    }

                    const loopEmoji = { none: '➡️', track: '🔂', queue: '🔁' };
                    embed.setFooter({
                        text: `${loopEmoji[player.loop] || '➡️'} Modo: ${player.loop} | 🔊 Volumen: ${player.volume}%`
                    });

                    await interaction.editReply({ embeds: [embed] });
                    break;
                }

                case 'volume': {
                    const level = interaction.options.getInteger('nivel');
                    const newVolume = kazagumoManager.setVolume(guild.id, level);

                    if (newVolume === null) {
                        await interaction.editReply('❌ No hay música reproduciéndose.');
                    } else {
                        const volumeBar = '▰'.repeat(Math.floor(newVolume / 10)) + '▱'.repeat(20 - Math.floor(newVolume / 10));
                        await interaction.editReply(`🔊 **Volumen ajustado a ${newVolume}%**\n\`${volumeBar}\``);
                    }
                    break;
                }

                case 'loop': {
                    const mode = interaction.options.getString('modo');
                    const newLoop = kazagumoManager.setLoop(guild.id, mode);

                    if (newLoop === null) {
                        await interaction.editReply('❌ No hay música reproduciéndose.');
                    } else {
                        const modes = {
                            none: '❌ **Repetición desactivada**',
                            track: '🔂 **Repitiendo canción actual**',
                            queue: '🔁 **Repitiendo toda la cola**'
                        };
                        await interaction.editReply(modes[mode]);
                    }
                    break;
                }

                case 'shuffle': {
                    if (kazagumoManager.shuffle(guild.id)) {
                        await interaction.editReply('🔀 **Cola mezclada exitosamente.**');
                    } else {
                        await interaction.editReply('❌ No hay suficientes canciones en la cola para mezclar.');
                    }
                    break;
                }

                case 'clear': {
                    if (kazagumoManager.clearQueue(guild.id)) {
                        await interaction.editReply('🗑️ **Cola limpiada.** Solo la canción actual seguirá reproduciéndose.');
                    } else {
                        await interaction.editReply('❌ No hay música reproduciéndose.');
                    }
                    break;
                }

                case 'nowplaying': {
                    const player = kazagumoManager.getPlayer(guild.id);
                    if (!player || !player.queue.current) {
                        return interaction.editReply('❌ No hay música reproduciéndose actualmente.');
                    }

                    const track = player.queue.current;
                    const formatDuration = (ms) => {
                        if (!ms || ms === 0) return '🔴 LIVE';
                        const seconds = Math.floor(ms / 1000);
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };

                    const embed = new EmbedBuilder()
                        .setColor('#9b59b6')
                        .setAuthor({ name: '🎶 Reproduciendo Ahora', iconURL: interaction.client.user.displayAvatarURL() })
                        .setTitle(track.title)
                        .setURL(track.uri)
                        .setThumbnail(track.thumbnail)
                        .addFields(
                            { name: '👤 Artista', value: track.author || 'Desconocido', inline: true },
                            { name: '⏱️ Duración', value: formatDuration(track.length), inline: true },
                            { name: '🎧 Pedido por', value: `${track.requester}`, inline: true },
                            { name: '🔊 Volumen', value: `${player.volume}%`, inline: true },
                            { name: '🔁 Loop', value: player.loop, inline: true },
                            { name: '📝 En cola', value: `${player.queue.size} canción(es)`, inline: true }
                        )
                        .setTimestamp();

                    const row = kazagumoManager.createMusicControls(player);
                    await interaction.editReply({ embeds: [embed], components: [row] });
                    break;
                }
            }
        } catch (error) {
            console.error('Music command error:', error);
            const errorMsg = `❌ **Error:** ${error.message || 'Ocurrió un error inesperado.'}`;

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMsg);
            } else {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        }
    }
};
