const DiscordJS = require('discord.js')

/**
 * @param {DiscordJS.Client} client
 * @param {DiscordJS.Interaction} interaction
*/

module.exports = (client, instance) => {
    

    client.on('interactionCreate', async (interaction) => {
        if(!interaction.isButton()) return
        await interaction.deferUpdate()

        const message = interaction.message
        const appChannel = client.channels.cache.get('964277029879033946')
        const consoleChannel = client.channels.cache.get('958993602950873138')

        const dcName = message.embeds[0].fields[1].value
        const mcName = message.embeds[0].fields[3].value
        const mcVersion = message.embeds[0].fields[4].value

        const dcServer = client.guilds.cache.get('789222642044633129')
        const matches = await dcServer.members.fetch({ query: dcName.split('#')[0] })
        const dcMember = matches.find(member => member.user.discriminator == dcName.split('#')[1])

        let disabledButtons = message.components[0]
        disabledButtons.components[0].setDisabled(true)
        disabledButtons.components[1].setDisabled(true)

        if(interaction.customId == 'deny') {
            let denyEmbed = message.embeds[0]
            denyEmbed.color = '#ff0000'
            
            message.edit({
                embeds: [denyEmbed],
                content: `Ansökan Nekad Av ${interaction.user}`,
                components: [disabledButtons]
            })

            appChannel.send(`🔨 ${dcMember || dcName}'s ansökan blev nekad av ${interaction.user}`)
            return
        }    
        
        //Accepted

        let acceptEmbed = message.embeds[0]
        acceptEmbed.color = '#00FF00'
        message.edit({
            embeds: [acceptEmbed],
            content: `Ansökan Accepterad Av ${interaction.user}`,
            components: [disabledButtons]
        })

        if(mcVersion == 'Java') {
            consoleChannel.send(`whitelist add ${mcName}`)
        }else {
            consoleChannel.send(`fwhitelist add ${mcName}`)
        }

        dcMember?.setNickname(mcName)

        dcMember.roles.add('963481840168099950')

        appChannel.send(`☑️ ${dcMember || dcName}'s ansökan blev accepterad av ${interaction.user}`)


    })

}
  

module.exports.config = {

    displayName: 'buttonClick',

    dbName: 'buttonClick'
}