const { Kazagumo, Plugins } = require('kazagumo');
const { Connectors } = require('shoukaku');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class KazagumoManager {
    constructor() {
        this.client = null;
        this.kazagumo = null;
    }

    /**
     * Initialize Kazagumo with Discord client
     * @param {Client} client - Discord.js client
     * @param {Array} nodes - Lavalink node configuration
     */
    initialize(client, nodes) {
        this.client = client;

        // Create Kazagumo instance with enhanced configuration
        this.kazagumo = new Kazagumo(
            {
                defaultSearchEngine: 'youtube_music', // Better reliability than regular YouTube
                plugins: [
                    new Plugins.PlayerMoved(client) // Auto-reconnect when user moves to another channel
                ],
                send: (guildId, payload) => {
                    const guild = client.guilds.cache.get(guildId);
                    if (guild) guild.shard.send(payload);
                }
            },
            new Connectors.DiscordJS(client),
            nodes
        );

        this.setupEventListeners();
        console.log('🎵 Kazagumo Manager initialized');
    }

    setupEventListeners() {
        // Player events
        this.kazagumo.on('playerStart', (player, track) => {
            this.sendNowPlaying(player, track);
        });

        this.kazagumo.on('playerEnd', (player) => {
            // Auto handled by Kazagumo queue system
        });

        this.kazagumo.on('playerEmpty', (player) => {
            player.data.get('textChannel')?.send('🛑 **Cola terminada.** Desconectándome en 30 segundos...');

            setTimeout(() => {
                if (!player.queue.size && !player.queue.current) {
                    player.destroy();
                }
            }, 30000);
        });

        this.kazagumo.on('playerClosed', (player, data) => {
            console.log(`🔌 Player closed in guild ${player.guildId}`);
        });

        this.kazagumo.on('playerException', (player, data) => {
            console.error('❌ Player exception:', data);
            player.data.get('textChannel')?.send(`❌ **Error al reproducir:** ${data.exception?.message || 'Desconocido'}`);
        });

        // Kazagumo global events
        this.kazagumo.shoukaku.on('ready', (name) => console.log(`✅ Lavalink node ${name} is ready`));
        this.kazagumo.shoukaku.on('error', (name, error) => console.error(`❌ Lavalink node ${name} error:`, error));
        this.kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`⚠️ Lavalink node ${name} closed: ${code} ${reason}`));
        this.kazagumo.shoukaku.on('disconnect', (name, count) => console.warn(`⚠️ Lavalink node ${name} disconnected (${count})`));
    }

    /**
     * Search for tracks
     * @param {string} query - Search query or URL
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Search result
     */
    async search(query, options = {}) {
        try {
            const result = await this.kazagumo.search(query, {
                requester: options.requester || null
            });

            return result;
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    /**
     * Create or get player for guild
     * @param {Object} options - Player options
     * @returns {Promise<KazagumoPlayer>} Player instance
     */
    async createPlayer(options) {
        let player = this.kazagumo.players.get(options.guildId);

        if (!player) {
            player = this.kazagumo.createPlayer({
                guildId: options.guildId,
                textId: options.textId,
                voiceId: options.voiceId,
                deaf: true
            });

            // Initialize data Map if it doesn't exist
            if (!player.data) {
                player.data = new Map();
            }

            // Store text channel reference for messages
            player.data.set('textChannel', options.textChannel);
        }

        return player;
    }

    /**
     * Play a track or playlist
     * @param {Interaction} interaction - Discord interaction
     * @param {string} query - Search query or URL
     */
    async play(interaction, query) {
        const { member, guild, channel } = interaction;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply('❌ Debes estar en un canal de voz.');
        }

        try {
            // Search for track
            const result = await this.search(query, { requester: interaction.user });

            if (!result || !result.tracks.length) {
                return interaction.editReply('❌ No se encontraron resultados.');
            }

            // Create or get player
            const player = await this.createPlayer({
                guildId: guild.id,
                textId: channel.id,
                voiceId: voiceChannel.id,
                textChannel: channel
            });

            // Add tracks to queue
            if (result.type === 'PLAYLIST') {
                for (const track of result.tracks) {
                    player.queue.add(track);
                }

                await interaction.editReply({
                    content: `✅ **Playlist añadida:** ${result.playlistName}\n📝 ${result.tracks.length} canciones agregadas a la cola`
                });
            } else {
                player.queue.add(result.tracks[0]);

                const track = result.tracks[0];
                await interaction.editReply({
                    content: player.playing ? `✅ **Añadido a la cola:** ${track.title}` : `🎶 **Reproduciendo:** ${track.title}`
                });
            }

            // Start playing if not already
            if (!player.playing && !player.paused) {
                player.play();
            }

        } catch (error) {
            console.error('Play error:', error);
            await interaction.editReply(`❌ Error al reproducir: ${error.message}`);
        }
    }

    /**
     * Send now playing embed
     * @param {KazagumoPlayer} player - Player instance
     * @param {KazagumoTrack} track - Current track
     */
    async sendNowPlaying(player, track) {
        const textChannel = player.data.get('textChannel');
        if (!textChannel) return;

        const formatDuration = (ms) => {
            const seconds = Math.floor(ms / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setAuthor({ name: '🎶 Reproduciendo Ahora', iconURL: this.client.user.displayAvatarURL() })
            .setTitle(track.title)
            .setURL(track.uri)
            .addFields(
                { name: '👤 Artista', value: track.author || 'Desconocido', inline: true },
                { name: '⏱️ Duración', value: track.isStream ? '🔴 LIVE' : formatDuration(track.length), inline: true },
                { name: '🎧 Pedido por', value: `${track.requester || 'Desconocido'}`, inline: true }
            );

        if (track.thumbnail) {
            embed.setThumbnail(track.thumbnail);
        }

        if (player.queue.size > 0) {
            embed.addFields({
                name: '📜 Siguiente',
                value: `${player.queue.size} canción(es) en cola`,
                inline: false
            });
        }

        const row = this.createMusicControls(player);

        try {
            await textChannel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error sending now playing:', error);
        }
    }

    /**
     * Create music control buttons
     * @param {KazagumoPlayer} player - Player instance
     * @returns {ActionRowBuilder} Button row
     */
    createMusicControls(player) {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('music_pause')
                .setEmoji(player.paused ? '▶️' : '⏸️')
                .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_skip')
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('music_stop')
                .setEmoji('⏹️')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('music_queue')
                .setEmoji('📜')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_shuffle')
                .setEmoji('🔀')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    /**
     * Get player for guild
     * @param {string} guildId - Guild ID
     * @returns {KazagumoPlayer|null} Player instance or null
     */
    getPlayer(guildId) {
        return this.kazagumo.players.get(guildId) || null;
    }

    /**
     * Stop playback and destroy player
     * @param {string} guildId - Guild ID
     * @returns {boolean} Success status
     */
    stop(guildId) {
        const player = this.getPlayer(guildId);
        if (!player) return false;

        player.destroy();
        return true;
    }

    /**
     * Skip current track
     * @param {string} guildId - Guild ID
     * @returns {boolean} Success status
     */
    skip(guildId) {
        const player = this.getPlayer(guildId);
        if (!player || !player.queue.current) return false;

        player.skip();
        return true;
    }

    /**
     * Toggle pause state
     * @param {string} guildId - Guild ID
     * @returns {boolean|null} Paused state or null if no player
     */
    pause(guildId) {
        const player = this.getPlayer(guildId);
        if (!player) return null;

        player.pause(!player.paused);
        return player.paused;
    }

    /**
     * Set volume
     * @param {string} guildId - Guild ID
     * @param {number} volume - Volume level (0-200)
     * @returns {number|null} New volume or null if no player
     */
    setVolume(guildId, volume) {
        const player = this.getPlayer(guildId);
        if (!player) return null;

        volume = Math.max(0, Math.min(200, volume));
        player.setVolume(volume);
        return volume;
    }

    /**
     * Set loop mode
     * @param {string} guildId - Guild ID
     * @param {string} mode - Loop mode: 'none', 'track', 'queue'
     * @returns {string|null} New loop mode or null if no player
     */
    setLoop(guildId, mode) {
        const player = this.getPlayer(guildId);
        if (!player) return null;

        if (mode === 'none') {
            player.setLoop('none');
        } else if (mode === 'track') {
            player.setLoop('track');
        } else if (mode === 'queue') {
            player.setLoop('queue');
        }

        return player.loop;
    }

    /**
     * Shuffle queue
     * @param {string} guildId - Guild ID
     * @returns {boolean} Success status
     */
    shuffle(guildId) {
        const player = this.getPlayer(guildId);
        if (!player || player.queue.size === 0) return false;

        player.queue.shuffle();
        return true;
    }

    /**
     * Clear queue
     * @param {string} guildId - Guild ID
     * @returns {boolean} Success status
     */
    clearQueue(guildId) {
        const player = this.getPlayer(guildId);
        if (!player) return false;

        player.queue.clear();
        return true;
    }
}

module.exports = new KazagumoManager();
