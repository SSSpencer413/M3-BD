//SSSpencer413

const fs = require('fs');

exports.run = async (Client, interaction) => {
    // Only admins can set up the server
    if (interaction.member.permissions.has("ADMINISTRATOR")) {
        // Resetting guild commands
        if (interaction.options.getSubcommand() == "reset") {
            interaction.guild.commands.fetch()
            .then((commands) => {
                commands.each((cmd) => cmd.delete());
            })
            .catch(console.error);

            interaction.reply({ content: 'Reset commands!', ephemeral: true});   

            /* // DEBUG -- deletes the main command
            Client.application.commands.fetch()
            .then((commands) => {
                commands.each((cmd) => cmd.delete());
            })
            .catch(console.error);  // */

        // Editing existing commands
        } else if (interaction.options.getSubcommand() == "edit") {
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            try {
                interaction.guild.commands.fetch()
                .then((commands) => {
                    let cmd = commands.find((value) => value.name == interaction.options.getString("command"));

                    cmd.permissions.set({permissions: [{
                        type: "ROLE",
                        permission: interaction.options.getBoolean("enabled"),
                        id: interaction.options.getRole("role").id
                    }]})
                    .then(interaction.reply({ content: 'Successfully edited command!', ephemeral: true}));
                })
                .catch(console.error);
            } catch (err) {
                console.error(err);
            }

            

        // Setup commands
        } else if (interaction.options.getSubcommand() == "setup") {
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (let file of commandFiles) {
                let command = require(`../commands/${file}`);

                if (command.commandData) {
                    let cmdData = command.commandData;
                    cmdData.defaultPermission = false;
                    interaction.guild.commands.create(cmdData)
                    .then((cmd) => {
                        cmd.permissions.add({permissions: [{
                            id: interaction.options.getRole("role").id,
                            type: 'ROLE',
                            permission: true
                        }]});
                    });
                }
            }
            interaction.reply({ content: 'Setup complete!', ephemeral: true});
        }
    } else {
        interaction.reply({ content: 'You must be an administrator to use this command!', ephemeral: true});
    }
};