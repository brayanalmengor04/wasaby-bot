module.exports = {
    name: "clientReady",
    once: true,
    execute(client) {
        console.log(`🤖 WASABY conectado como ${client.user.tag}`);
    },
};
