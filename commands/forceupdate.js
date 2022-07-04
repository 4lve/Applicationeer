const { google } = require('googleapis');
const DiscordJS = require('discord.js')
const service = google.sheets('v4');
const credentials = require('../credentials.json');
const fs = require('fs');
const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
);

/**
 * @param {DiscordJS.Client} client
 * @param {DiscordJS.Interaction} interaction
*/

module.exports = {
    category: 'Application',
    description: 'Force Updated Applications',
    
    slash: true,
    
    callback: ({ interaction }) => {
      
        (async function () {
            try {
                const client = interaction.client;
                await interaction.reply({
                    content: 'Updating applications...',
                    ephemeral: true
                });
    
                const spreadsheetId = '1v1j0-EXe0cPMrGO9HvHAVLwKwWzuq6hctSCjrcSrJOY';
                const range = 'A:J';
                const res = await service.spreadsheets.values.get({ auth: authClient, spreadsheetId: spreadsheetId, range: range });
                const rows = res.data.values;
                if (!rows.length) return
                //Headers
                rows.shift();
    
    
                let appcount = parseInt(fs.readFileSync('./read.count', 'utf8'));
    
        
                for (let i = appcount; i < rows.length; i++) {
                    let application = rows[i];
    
                    const time = application[0];
                    const mail = application[1];
                    const discordName = application[2];
                    const joinedDc = application[3];
                    const mcName = application[4];
                    const mcVersion = application[5];
                    const whyJoin = application[6];
                    const aboutYou = application[7];
                    const foundServer = application[8];
                    const readRules = application[9];
    
                    const appEmbed = new DiscordJS.MessageEmbed()
                        .setTitle(discordName)
                        .setColor('#0099ff')
                        .setDescription('Ny ansökan! <@&963481381990715452>')
                        .setTimestamp(time)
                        .addField('Mail', mail)
                        .addField('Discord', discordName)
                        .addField('Joinat Discorden', joinedDc)
                        .addField('Minecraft Namn', mcName)
                        .addField('Minecraft Version', mcVersion)
                        .addField('Varför vill du joina?', whyJoin)
                        .addField('Berätta om dig själv?', aboutYou)
                        .addField('Hur hittade du servern?', foundServer)
                        .addField('Läst regler?', readRules);
    
    
                    const buttons = new DiscordJS.MessageActionRow()
                        .addComponents(
                            new DiscordJS.MessageButton()
                                .setEmoji('☑️')
                                .setCustomId('accept')
                                .setStyle(DiscordJS.Constants.MessageButtonStyles.SUCCESS)
                                .setLabel('Acceptera'),
                            new DiscordJS.MessageButton()
                                .setEmoji('🔨')
                                .setCustomId('deny')
                                .setStyle(DiscordJS.Constants.MessageButtonStyles.DANGER)
                                .setLabel('Neka')
                        )
                    
    
                    client.channels.cache.get('964226932537442403').send({
                        embeds: [appEmbed],
                        content: 'Ny ansökan! <@&963481381990715452>',
                        components: [buttons]
                    });
    
                }
                if(appcount !== rows.length) {
                    fs.writeFileSync('./read.count', rows.length.toString());
                }
    
    
            }catch (e) {
                console.error(e);
            }
        })();


    },
  }