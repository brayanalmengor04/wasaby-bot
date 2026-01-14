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

        if (!voiceChannel && !['queue', 'nowplaying'].includes(subcommand)) {
            return interaction.editReply('Debes estar en un canal de voz para usar este comando.');
        }

        try {
            switch (subcommand) {
                case 'play': {
                    const query = interaction.options.getString('cancion');
                    const isUrl = /^https?:\/\//.test(query);

                    if (isUrl) {
                        await kazagumoManager.play(interaction, query);
                        return;
                    }

                    const searchResult = await kazagumoManager.search(query, { requester: interaction.user });

                    if (!searchResult || !searchResult.tracks || searchResult.tracks.length === 0) {
                        return interaction.editReply('No se encontraron resultados para tu búsqueda.');
                    }

                    if (searchResult.tracks.length === 1) {
                        await kazagumoManager.play(interaction, searchResult.tracks[0].uri);
                        return;
                    }

                    const topTracks = searchResult.tracks.slice(0, 10);

                    const formatDuration = (ms) => {
                        if (!ms || ms === 0) return 'LIVE';
                        const seconds = Math.floor(ms / 1000);
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };

                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`## Resultados de Búsqueda
**Consulta:** ${query}

Selecciona una canción del menú:
${topTracks.map((track, i) => `**${i + 1}.** ${track.title.substring(0, 60)} (${formatDuration(track.length)})`).join('\n')}`)
                        .setFooter({
                            text: `Solicitado por ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setTimestamp();

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('music_search_select')
                        .setPlaceholder('Selecciona una canción...')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(
                            topTracks.map((track, i) => ({
                                label: `${i + 1}. ${track.title.substring(0, 90)}`,
                                description: `${track.author.substring(0, 50)} • ${formatDuration(track.length)}`,
                                value: track.uri
                            }))
                        );

                    const row = new ActionRowBuilder().addComponents(selectMenu);

                    const response = await interaction.editReply({
                        embeds: [embed],
                        components: [row]
                    });

                    const collector = response.createMessageComponentCollector({
                        componentType: ComponentType.StringSelect,
                        time: 60000
                    });

                    collector.on('collect', async (selectInteraction) => {
                        if (selectInteraction.user.id !== interaction.user.id) {
                            return selectInteraction.reply({
                                content: 'Solo quien solicitó la búsqueda puede seleccionar.',
                                ephemeral: true
                            });
                        }

                        const selectedUri = selectInteraction.values[0];
                        const selectedTrack = topTracks.find(t => t.uri === selectedUri);

                        await selectInteraction.deferUpdate();

                        await interaction.editReply({
                            content: `Cargando: **${selectedTrack.title}**`,
                            embeds: [],
                            components: []
                        });

                        await kazagumoManager.play(interaction, selectedUri);
                        collector.stop('selected');
                    });

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            interaction.editReply({
                                content: 'Tiempo de selección expirado.',
                                embeds: [],
                                components: []
                            }).catch(() => { });
                        }
                    });
                    break;
                }

                case 'stop': {
                    if (kazagumoManager.stop(guild.id)) {
                        await interaction.editReply('Música detenida.');
                    } else {
                        await interaction.editReply('No hay música reproduciéndose.');
                    }
                    break;
                }

                case 'skip': {
                    if (kazagumoManager.skip(guild.id)) {
                        await interaction.editReply('Canción saltada.');
                    } else {
                        await interaction.editReply('No hay canciones para saltar.');
                    }
                    break;
                }

                case 'pause': {
                    const paused = kazagumoManager.pause(guild.id);
                    if (paused === null) {
                        await interaction.editReply('No hay música reproduciéndose.');
                    } else {
                        await interaction.editReply(paused ? 'Música pausada.' : 'Música reanudada.');
                    }
                    break;
                }

                case 'queue': {
                    const player = kazagumoManager.getPlayer(guild.id);
                    if (!player || (!player.queue.current && player.queue.size === 0)) {
                        return interaction.editReply('La cola está vacía.');
                    }

                    const current = player.queue.current;
                    const queue = player.queue;

                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setTitle('Cola de Reproducción');

                    if (current) {
                        embed.setDescription(`**Reproduciendo Ahora**
[${current.title}](${current.uri}) - **${current.author}**`);
                    }

                    if (queue.size > 0) {
                        const queueList = queue.map((track, i) => {
                            return `**${i + 1}.** ${track.title.substring(0, 50)} - ${track.author.substring(0, 30)}`;
                        }).slice(0, 10).join('\n');

                        embed.addFields({
                            name: `Siguiente (${queue.size})`,
                            value: queueList + (queue.size > 10 ? `\n...y ${queue.size - 10} más` : '')
                        });
                    }

                    const loopMode = { none: 'Desactivado', track: 'Canción', queue: 'Cola' };
                    embed.setFooter({
                        text: `Loop: ${loopMode[player.loop] || 'Off'} • Vol: ${player.volume}%`
                    });

                    await interaction.editReply({ embeds: [embed] });
                    break;
                }

                case 'volume': {
                    const level = interaction.options.getInteger('nivel');
                    const newVolume = kazagumoManager.setVolume(guild.id, level);

                    if (newVolume === null) {
                        await interaction.editReply('No hay música reproduciéndose.');
                    } else {
                        await interaction.editReply(`Volumen ajustado a ${newVolume}%`);
                    }
                    break;
                }

                case 'loop': {
                    const mode = interaction.options.getString('modo');
                    const newLoop = kazagumoManager.setLoop(guild.id, mode);

                    if (newLoop === null) {
                        await interaction.editReply('No hay música reproduciéndose.');
                    } else {
                        const modes = {
                            none: 'Repetición desactivada.',
                            track: 'Repitiendo canción actual.',
                            queue: 'Repitiendo toda la cola.'
                        };
                        await interaction.editReply(modes[mode]);
                    }
                    break;
                }

                case 'shuffle': {
                    if (kazagumoManager.shuffle(guild.id)) {
                        await interaction.editReply('Cola mezclada.');
                    } else {
                        await interaction.editReply('No hay suficientes canciones para mezclar.');
                    }
                    break;
                }

                case 'clear': {
                    if (kazagumoManager.clearQueue(guild.id)) {
                        await interaction.editReply('Cola limpiada.');
                    } else {
                        await interaction.editReply('No hay música reproduciéndose.');
                    }
                    break;
                }

                case 'nowplaying': {
                    const player = kazagumoManager.getPlayer(guild.id);
                    if (!player || !player.queue.current) {
                        return interaction.editReply('No hay música reproduciéndose.');
                    }

                    const track = player.queue.current;
                    const formatDuration = (ms) => {
                        if (!ms || ms === 0) return 'live';
                        const seconds = Math.floor(ms / 1000);
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };

                    const embed = new EmbedBuilder()
                        .setColor('#2b2d31')
                        .setDescription(`## [${track.title}](${track.uri})
            
**Autor:** ${track.author || 'Desconocido'}
**Duración:** ${formatDuration(track.length)}
**Pedido por:** ${track.requester.globalName || track.requester.username || 'Desconocido'}

**Estado:**
Volumen: ${player.volume}% • Loop: ${player.loop} • En cola: ${player.queue.size} canción(es)`)
                        .setThumbnail(track.thumbnail || null)
                        .setTimestamp();

                    const row = kazagumoManager.createMusicControls(player);
                    await interaction.editReply({ embeds: [embed], components: [row] });
                    break;
                }
            }
        } catch (error) {
            console.error('Music command error:', error);
            const errorMsg = `Error: ${error.message || 'Ocurrió un error inesperado.'}`;

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(errorMsg);
            } else {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        }
    }
};
