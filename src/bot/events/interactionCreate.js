const kazagumoManager = require('../managers/KazagumoManager');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handle autocomplete for music search
        if (interaction.isAutocomplete()) {
            if (interaction.commandName === 'music' && interaction.options.getSubcommand() === 'play') {
                const query = interaction.options.getFocused();

                // Don't search for very short queries
                if (!query || query.length < 2) {
                    return interaction.respond([]);
                }

                try {
                    const result = await kazagumoManager.search(query, { requester: interaction.user });

                    if (!result || !result.tracks || result.tracks.length === 0) {
                        return interaction.respond([{
                            name: '❌ No se encontraron resultados',
                            value: query
                        }]);
                    }

                    // Format duration helper
                    const formatDuration = (ms) => {
                        if (!ms || ms === 0) return '🔴 LIVE';
                        const seconds = Math.floor(ms / 1000);
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };

                    // Return top 25 results with rich formatting
                    const choices = result.tracks.slice(0, 25).map(track => {
                        const title = track.title.substring(0, 60);
                        const author = track.author.substring(0, 25);
                        const duration = formatDuration(track.length);

                        return {
                            name: `🎵 ${title} - ${author} (${duration})`,
                            value: track.uri
                        };
                    });

                    await interaction.respond(choices);
                } catch (error) {
                    console.error('Autocomplete error:', error);
                    await interaction.respond([{
                        name: '❌ Error al buscar canciones',
                        value: query
                    }]);
                }
            }
            return;
        }

        // Handle select menu interactions
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'music_search_select') {
                // Defer update to prevent timeout
                await interaction.deferUpdate();

                const selectedUri = interaction.values[0];
                const selectedTrack = interaction.message.embeds[0]?.footer?.text || 'canción seleccionada';

                // Update message to show loading
                await interaction.editReply({
                    content: `⏳ **Cargando:** ${selectedTrack}...`,
                    embeds: [],
                    components: []
                });

                // Play the selected track
                try {
                    await kazagumoManager.play(interaction, selectedUri);
                } catch (error) {
                    console.error('Error playing selected track:', error);
                    await interaction.editReply({
                        content: `❌ **Error:** ${error.message || 'No se pudo reproducir la canción.'}`
                    });
                }
            }
            return;
        }

        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}:`, error);
                const errorMessage = { content: '❌ Hubo un error al ejecutar este comando.', ephemeral: true };

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }

        // Handle button interactions for music controls
        if (interaction.isButton()) {
            const { customId, guildId } = interaction;

            // Music control buttons
            if (customId.startsWith('music_')) {
                // Acknowledge interaction immediately to prevent timeout
                await interaction.deferReply({ ephemeral: true });

                const player = kazagumoManager.getPlayer(guildId);

                if (!player) {
                    return interaction.editReply({
                        content: '❌ No hay música reproduciéndose.'
                    });
                }

                // Check if user is in the same voice channel
                const member = interaction.member;
                if (!member.voice.channel || member.voice.channel.id !== player.voiceId) {
                    return interaction.editReply({
                        content: '❌ Debes estar en el mismo canal de voz que el bot.'
                    });
                }

                try {
                    switch (customId) {
                        case 'music_pause':
                            const paused = kazagumoManager.pause(guildId);
                            await interaction.editReply({
                                content: paused ? '⏸️ **Pausado**' : '▶️ **Reanudado**'
                            });

                            // Update the button
                            const newRow = kazagumoManager.createMusicControls(player);
                            await interaction.message.edit({ components: [newRow] }).catch(() => { });
                            break;

                        case 'music_skip':
                            if (kazagumoManager.skip(guildId)) {
                                await interaction.editReply({
                                    content: '⏭️ **Saltando canción...**'
                                });
                            } else {
                                await interaction.editReply({
                                    content: '❌ No hay más canciones en la cola.'
                                });
                            }
                            break;

                        case 'music_stop':
                            kazagumoManager.stop(guildId);
                            await interaction.editReply({
                                content: '🛑 **Música detenida.** ¡Hasta la próxima!'
                            });

                            // Remove buttons from message
                            await interaction.message.edit({ components: [] }).catch(() => { });
                            break;

                        case 'music_queue':
                            if (!player.queue.current && player.queue.size === 0) {
                                return interaction.editReply({
                                    content: '📭 **La cola está vacía.**'
                                });
                            }

                            const current = player.queue.current;
                            const queueList = player.queue.map((track, i) => {
                                return `**${i + 1}.** ${track.title.substring(0, 50)}`;
                            }).slice(0, 10).join('\n');

                            let message = `🔊 **Reproduciendo:** ${current.title}\n\n`;
                            if (player.queue.size > 0) {
                                message += `📝 **Siguiente (${player.queue.size} en cola):**\n${queueList}`;
                                if (player.queue.size > 10) {
                                    message += `\n\n*...y ${player.queue.size - 10} más*`;
                                }
                            } else {
                                message += '*No hay más canciones en la cola.*';
                            }

                            await interaction.editReply({
                                content: message
                            });
                            break;

                        case 'music_shuffle':
                            if (kazagumoManager.shuffle(guildId)) {
                                await interaction.editReply({
                                    content: '🔀 **Cola mezclada exitosamente.**'
                                });
                            } else {
                                await interaction.editReply({
                                    content: '❌ No hay suficientes canciones para mezclar.'
                                });
                            }
                            break;

                        default:
                            await interaction.editReply({
                                content: '❌ Botón no reconocido.'
                            });
                    }
                } catch (error) {
                    console.error('Button interaction error:', error);
                    const errMsg = '❌ Error al procesar la acción.';
                    if (interaction.deferred) {
                        await interaction.editReply({ content: errMsg }).catch(() => { });
                    } else {
                        await interaction.reply({ content: errMsg, ephemeral: true }).catch(() => { });
                    }
                }
            }
        }
    }
};
