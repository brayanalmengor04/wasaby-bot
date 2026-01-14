const { Kazagumo, Plugins } = require('kazagumo');
const { Connectors } = require('shoukaku');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');



class KazagumoManager {
    constructor() {
        this.client = null;
        this.kazagumo = null;
    }

    initialize(client, nodes) {
        this.client = client;

        this.kazagumo = new Kazagumo(
            {
                defaultSearchEngine: 'youtube_music',
                plugins: [new Plugins.PlayerMoved(client)],
                send: (guildId, payload) => {
                    const guild = client.guilds.cache.get(guildId);
                    if (guild) guild.shard.send(payload);
                }
            },
            new Connectors.DiscordJS(client),
            nodes
        );

        this.setupEventListeners();
        console.log('Kazagumo Manager initialized');
    }

    setupEventListeners() {
        this.kazagumo.on('playerStart', (player, track) => {
            this.sendNowPlaying(player, track);
        });

        this.kazagumo.on('playerEmpty', (player) => {
            player.data.get('textChannel')?.send('Cola terminada. Desconectando en 30 segundos.');

            setTimeout(() => {
                if (!player.queue.size && !player.queue.current) {
                    player.destroy();
                }
            }, 30000);
        });

        this.kazagumo.on('playerClosed', (player) => {
            console.log(`Player closed in guild ${player.guildId}`);
        });

        this.kazagumo.on('playerException', (player, data) => {
            player.data.get('textChannel')?.send(
                `Error al reproducir: ${data.exception?.message || 'Desconocido'}`
            );
        });

        this.kazagumo.shoukaku.on('ready', (name) =>
            console.log(`Lavalink node ${name} ready`)
        );
    }

    async search(query, options = {}) {
        return this.kazagumo.search(query, {
            requester: options.requester || null
        });
    }

    async createPlayer(options) {
        let player = this.kazagumo.players.get(options.guildId);

        if (!player) {
            player = this.kazagumo.createPlayer({
                guildId: options.guildId,
                textId: options.textId,
                voiceId: options.voiceId,
                deaf: true
            });

            player.data = new Map();
            player.data.set('textChannel', options.textChannel);
        }

        return player;
    }

    async play(interaction, query) {
        const { member, guild, channel } = interaction;
        const voiceChannel = member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply('Debes estar en un canal de voz.');
        }

        const result = await this.search(query, { requester: interaction.user });
        if (!result?.tracks.length) {
            return interaction.editReply('No se encontraron resultados.');
        }

        const player = await this.createPlayer({
            guildId: guild.id,
            textId: channel.id,
            voiceId: voiceChannel.id,
            textChannel: channel
        });

        if (result.type === 'PLAYLIST') {
            result.tracks.forEach(track => player.queue.add(track));

            await interaction.editReply(
                `Playlist añadida: ${result.playlistName}\n${result.tracks.length} canciones agregadas`
            );
        } else {
            const track = result.tracks[0];
            player.queue.add(track);

            await interaction.editReply(
                player.playing
                    ? `Añadido a la cola: ${track.title}`
                    : `Reproduciendo ahora: ${track.title}`
            );
        }

        if (!player.playing && !player.paused) {
            player.play();
        }
    }

    async sendNowPlaying(player, track) {
        const textChannel = player.data.get('textChannel');
        if (!textChannel) return;

        const formatDuration = ms => {
            const s = Math.floor(ms / 1000);
            return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        };

        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setThumbnail(track.thumbnail || null)
            .setDescription(`## [${track.title}](${track.uri})
            
**Autor:** ${track.author || 'Desconocido'}
**Duración:** ${track.isStream ? 'LIVE' : formatDuration(track.length)}
**Pedido por:** ${track.requester.globalName || track.requester.username || 'Desconocido'}`)
            .setFooter({ text: `Wasaby Music System ${player.queue.size > 0 ? `• ${player.queue.size} canciones en cola` : ''}` })
            .setTimestamp();

        await textChannel.send({
            embeds: [embed],
            components: [this.createMusicControls(player)]
        });
    }

    createMusicControls(player) {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('music_pause')
                .setLabel(player.paused ? 'Reanudar' : 'Pausar')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_skip')
                .setLabel('Saltar')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('music_stop')
                .setLabel('Detener')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('music_queue')
                .setLabel('Cola')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('music_shuffle')
                .setLabel('Mezclar')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    getPlayer(guildId) {
        return this.kazagumo.players.get(guildId) || null;
    }

    stop(guildId) {
        const player = this.getPlayer(guildId);
        if (!player) return false;
        player.destroy();
        return true;
    }

    skip(guildId) {
        const player = this.getPlayer(guildId);
        if (!player?.queue.current) return false;
        player.skip();
        return true;
    }

    pause(guildId) {
        const player = this.getPlayer(guildId);
        if (!player) return null;
        player.pause(!player.paused);
        return player.paused;
    }

    setVolume(guildId, volume) {
        const player = this.getPlayer(guildId);
        if (!player) return null;
        volume = Math.max(0, Math.min(200, volume));
        player.setVolume(volume);
        return volume;
    }

    setLoop(guildId, mode) {
        const player = this.getPlayer(guildId);
        if (!player) return null;
        player.setLoop(mode);
        return player.loop;
    }

    shuffle(guildId) {
        const player = this.getPlayer(guildId);
        if (!player || !player.queue.size) return false;
        player.queue.shuffle();
        return true;
    }

    clearQueue(guildId) {
        const player = this.getPlayer(guildId);
        if (!player) return false;
        player.queue.clear();
        return true;
    }
}

module.exports = new KazagumoManager();
