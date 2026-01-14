const { Kazagumo, Plugins } = require('kazagumo');
const { } = require('shoukaku');

const node = [];

module.exports = (client) => {
    const kazagumo = new Kazagumo(
        {
            defaultSearchEngine: 'youtube',
            plugins: [new Plugins.PlayerMoved(client)],
            send: (guildId, payload) => {
                const guild = client.guilds.cache.get(guildId)
                if (guildId) guild.send(payload);
            },
        },
        new Connectors.DiscordJS(client),
        node
    );
    client.kazagumo = kazagumo;
};

