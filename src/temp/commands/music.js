const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require('discord.js');
const { Kazagumo } = require('kazagumo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Play your music!')
        .addSubcommand((subCommand) =>
            subCommand
                .setName('play')
                .setDescription('Play a song')
                .addStringOption((option) =>
                    option.setName('song-title').setDescription('Type a music title').setRequired(true)
                )
        )
        .addSubcommand((subCommand) => subCommand.setName('stop').setDescription('Stop the music')),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Kazagumo} [kazagumo=client.kazagumo]
     * @param {Client} client
     */
    async execute(interaction, client, kazagumo = client.kazagumo) {
        const { options, member, channel, guild, user } = interaction;

        let player;
        switch (options.getSubcommand()) {
            case 'play':
                // He completado esta línea ya que en la imagen estaba a medias (member.voi)
                const voiceChannel = member.voice.channel;
                if (!voiceChannel) return interaction.reply("Error: You are not in a voice channel");
                const query = options.getString('song-title');
                await interaction.reply({
                    content: `Searching...\`${query}\``
                });
                try {
                    player = kazagumo.createPlayer({
                        guildId: guild.id,
                        textId: channel.id,
                        voiceId: voiceChannel.id,
                    })

                    let result = await kazagumo.search(query, { requestedBy: user })
                    if (!result.tracks.length) return interaction.reply("Error: No results found");
                    if (result.type === 'PLAYLIST') (await player).queue.add(result.tracks)
                    else (await player).queue.add(result.tracks[0])
                    if (!(await player).playing && !player.paused) player.play()
                    await interaction.followUp({
                        content:
                            result.type === 'PLAYLIST' ? `Se ha agregado a la lista ${result.playlistName}` : `Se ha agregado ${result.tracks[0].title}`,
                    })
                } catch (e) {
                    console.log(e)
                }
                break;
            case 'stop':
                player = kazagumo.getPlayer(guild.id);
                if (!player) return interaction.reply("Error: No se esta reproducciendo");

                await player.destroy();
                await interaction.reply('Se ha detenido la reproduccion');
                break;
            default:
                break;
        }
    },
};