// SSSpencer413

const Discord = require("discord.js");
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS']});
const fs = require("fs");
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

client.on("ready", () => {
    console.log("Ready!");

    // Check if we've made the setup command before
    client.application?.commands.fetch()
    .then((commands) => {
        // Can't find it? Create a new one!
        if (!commands.find((cmd) => cmd.name === "mb3d")) {
            // Compile all of the commands into one array
            var commandList = [];
            for (let icmd of commandFiles) {
                if (icmd !== "mb3d.js") {
                    commandList.push({
                        name: icmd.substring(0, icmd.indexOf(".js")),
                        value: icmd.substring(0, icmd.indexOf(".js"))
                    });
                }
            }

            client.application?.commands.create({
                name: 'mb3d',
                description: 'The master command for the bot commands.',
                options: [
                    {
                        name: 'setup',
                        type: 'SUB_COMMAND',
                        description: 'Sets up all of the bot commands.',
                        options: [
                            {
                                name: "role",
                                description: "Which role should use the commands. Set to @everyone if you want everyone to have access.",
                                type: "ROLE",
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'edit',
                        type: 'SUB_COMMAND',
                        description: 'Edit the permissions of the bot commands.',
                        options: [
                            {
                                name: "command",
                                description: "Which command you want to change the permission for.",
                                required: true,
                                type: "STRING",
                                choices: commandList
                            },
                            {
                                name: "role",
                                description: "Which role you want to change the permission for.",
                                required: true,
                                type: "ROLE"
                            },
                            {
                                name: "enabled",
                                description: "Whether the role can use the command.",
                                required: true,
                                type: "BOOLEAN"
                            },
                        ]
                    },
                    {
                        name: 'reset',
                        type: 'SUB_COMMAND',
                        description: 'Resets all of the bot commands.'
                    }
                ]
            });
            
            console.log("Created deploy command!");
        }
    })
    .catch(console.error);

});

// When a user uses the interaction
client.on("interactionCreate", (interaction) => {
    if (interaction.isContextMenu() || interaction.isCommand()) {
        try {
            let command = require(`./commands/${interaction.commandName}.js`);
            command.run(client, interaction);
        } catch (err) {
            console.error(err);
        }
    }
});

client.login(process.env.TOKEN);