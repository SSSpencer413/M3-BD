//SSSpencer413

const handbrake = require("handbrake-js");
const https = require("https");
const fs = require("fs");

exports.commandData = {
    name: 'mp4',
    type: "MESSAGE",
    defaultPermission: false
};

exports.run = async (Client, interaction) => {
    await interaction.deferReply();

    var msg = await interaction.channel.messages.fetch(interaction.targetId);

    var convertedFiles = [];
    var tmpFiles = [];

    // I've spent like an hour trying to figure out how tf to use Discord.js collections to do this asychronously and I give up
    var filteredVideos = msg.attachments.filter(attachment => attachment.contentType.startsWith("video/"));
    var values = Array.from(filteredVideos.values());

    for (let i = 0; i < values.length; i++) {
        let attachment = values[i];
        try {
            // Download the attachment, then convert it
            let attachmentName = i + attachment.name;
            download(attachment.url, "./tmp/"+attachmentName, function() {
                tmpFiles.push("./tmp/"+attachmentName);

                handbrake.spawn({ input: "./tmp/"+attachmentName, output: "./exported/"+attachmentName+".mp4"})
                .on("complete", () => {
                    if (fs.existsSync("./exported/"+attachmentName+".mp4") && (fs.statSync("./exported/"+attachmentName+".mp4").size <= getUploadLimit(interaction.guild))) {
                        convertedFiles.push("./exported/"+attachmentName+".mp4");
                    }

                    // We're on the last iteration, so send the message
                    if (i == (values.length - 1)) {
                        sendMessage(interaction, msg, convertedFiles);
                        deleteFiles(tmpFiles);
                    }
                })
                .on('error', err => {
                    console.error(err);
                });
            });
        // Something must've happened
        } catch (e) {
            console.error(e.code + " - " + e.msg);
        }
    };

};

// Function to download
function download(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    });
}

// Function to get upload limit
function getUploadLimit(guild) {
    switch (guild.PremiumTier) {
        case("TIER_3") : return 100 * 1000000;
        case("TIER_2") : return 50 * 1000000;
        default : return 8 * 1000000;
    }
}

// Function to delete files stored in tmp
function deleteFiles(files) {
    for (let file of files) {
        fs.unlink(file, function(){
            
        });
    }
    
}

// Function to send the final message
function sendMessage(interaction, msg, convertedFiles) {
    try {
        interaction.editReply({content: `Converted ${convertedFiles.length} video${convertedFiles.length == 1 ? "" : "s"} from: \n${msg.url}`, files: convertedFiles})
        .then(() => {deleteFiles(convertedFiles)}).catch(() => {deleteFiles(convertedFiles)});
    } catch(err) {
        console.error(err);
    }
}