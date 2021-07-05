const Discord = require("discord.js");
const { Client, Intents } = require("discord.js");
const intents = new Intents([
    Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
]);
const client = new Client({ ws: { intents } });
const { google } = require("googleapis");
const fs = require('fs');
let state = -1
let dcname = ''
let mcname = ''
let dcid = ''
let verificationLevel = 0
let veryfyID = 0
let dcMember
let java = true
const prefix = 'a.'

const service = google.sheets("v4");
const credentials = require("./credentials.json");

const authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
);



client.on('message', message =>{
    //command stuff
});

client.once('ready', () => {
    console.log('Applicationeer is online!');
    function updateApplications() {
        (async function () {
            try {

                let guild = client.guilds.cache.get('789222642044633129')
                await guild.members.fetch()
                await guild.roles.fetch()

                // Authorize the client
                const token = await authClient.authorize();

                // Set the client credentials
                authClient.setCredentials(token);

                // Get the rows
                const res = await service.spreadsheets.values.get({
                    auth: authClient,
                    spreadsheetId: "17g2zmLfvDe8cgkY1XsXASliMp_xVYX6dVuYy03DXhH0",
                    range: "A:L",
                });

                // All of the answers
                const answers = [];

                // Set rows to equal the rows
                const rows = res.data.values;

                // Check if we have any data and if we do add it to our answers array
                if (rows.length) {

                    // Remove the headers
                    rows.shift()

                    // For each row
                    for (const row of rows) {
                        answers.push({ timeStamp: row[0], answer1: row[1], answer2: row[2], answer3: row[3], answer4: row[4], answer5: row[5], answer6: row[6], answer7: row[7], answer8: row[8], answer9: row[9], answer10: row[10], answer11: row[11] });
                    }

                } else {
                    console.log("No data found.");  
                }

                // Saved the answers
                fs.writeFileSync("answers.json", JSON.stringify(answers), function (err, file) {
                    if (err) throw err;
                    console.log("Saved!");
                });

                //Check if new
                const apread = parseInt(fs.readFileSync("apread.txt", 'utf8'))
                if ((rows.length) >= (apread + 1)) {
                    console.log("New Application Found!")
                    const readrows = rows[apread]
                    let newapmsg = new Discord.MessageEmbed()
                        .setColor('#9900cc')
                        .setTitle('Ny Applikation!')
                        .setAuthor('Applicationeer', 'https://cdn.discordapp.com/avatars/861288086839361556/bdb0a2250f8cc8b56ef86d8525a7fe4e.webp?size=256')
                        .setDescription(`
                        MC Namn: ${readrows[1]}\n
                        Version: ${readrows[2]}\n
                        Discord Namn: ${readrows[3]}\n
                        Är i discorden: ${readrows[4]}\n
                        Varför vill gå med: ${readrows[5]}\n
                        Besriv dig själv: ${readrows[6]}\n
                        Erfarenhet Privata servrar: ${readrows[7]}\n
                        Kunskap (1-10): ${readrows[8]}\n
                        Lita (1-10): ${readrows[9]}\n
                        Hittade Servern: ${readrows[10]}\n
                        Läst Reglerna: ${readrows[11]}\n
                        `)

                        state = 0
                        dcid = 0
                        dcname = readrows[3]
                        mcname = readrows[1]
                        let splitdcname = dcname.split('#')
                        let user = null
                        if (readrows[2] == "Java") {
                            java = true
                        }else if(readrows[2] == "Bedrock") {
                            java = false
                        }else {
                            console.log("Version Fel!")
                        }
                        try{
                            user = client.users.cache.find(user => user.username === (splitdcname[0]))
                            if (user) {
                                verificationLevel = 1
                                dcid = user.id
                                dcMember = user
                                if (user.discriminator === splitdcname[1]) {
                                    verificationLevel = 2
                                }
                            }else {
                                verificationLevel = 0
                            }
                        }catch (error) {
                            console.error(error);
                        }

                        client.channels.cache.get("861289814799679489").send(newapmsg)
                        .then(message =>{
                            message.react('✅').then(() => message.react('❌'));
                        })
                    fs.writeFileSync("apread.txt", (apread + 1).toString() , 'utf8', function (err, file) {
                        if (err) throw err;
                        console.log("Nummer Uppdaterat!");
                    });
                }else{
                    console.log("No New Application Found.")
                }

            } catch (error) {

                // Log the error
                console.log(error);

                // Exit the process with error
                process.exit(1);

            }

        })();
    }
    updateApplications()
});


client.on('messageReactionAdd', async (reaction, user) => {
	if (reaction.message.channel == `861289814799679489` && reaction.message.author.id == client.user.id && !reaction.me) {
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        // Now the message has been cached and is fully available
        if (reaction.emoji.name == "✅") {
            if (state == 0) {
                if (verificationLevel == 0) {
                    reaction.message.channel.send(`${user}, Kunde Inte Automstisk Hitta Personen I Discorden Kan Du Bekräfta Att ${dcname} Är Med I Discorden?`)
                        .then(message =>{
                        message.react('✅').then(() => message.react('❌'));
                        state = 1;
                    })
                }else if (verificationLevel == 1) {
                    reaction.message.channel.send(`${user}, Hittade ${dcname} Automatiskt Med 80% Säkerhet.`)
                    state = 3
                    //Hittad Automatiskt
                    whielistPlayer(mcname, dcid, dcMember, java)
                }else if (verificationLevel == 2) {
                    reaction.message.channel.send(`${user}, Hittade ${dcname} Automatiskt Med 99.9% Säkerhet.`)
                    state = 3
                    //Hittad Automatiskt
                    whielistPlayer(mcname, dcid, dcMember, java)
                }
            }else if (state == 1) {
                function askForId(user, dcname) {
                    let filter = m => m.author.id === user.id
                    reaction.message.channel.send(`${user}, Okej personen är med i discorden kan du skicka användarens ID? (Inom 30 sekunder)`).then(() => {
                    reaction.message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 30000,
                        errors: ['time']
                        })
                        .then(collected => {
                        let m = collected.first()
                        try{
                            let memID = parseInt(m.content)
                            if (memID){
                                console.log(memID)
                                veryfyID = client.users.cache.find(user => user.id == (memID))
                                if (veryfyID) {
                                    dcid = veryfyID.id
                                    dcMember = veryfyID
                                    //Discord id är rätt
                                    whielistPlayer(mcname, dcid, dcMember, java)
                                }else {
                                    console.log("Unvalid VerifyID")
                                    return askForId(user, dcname);
                                }
                            }else{
                                console.log("Text Där det ska vara nummer")
                                return askForId(user, dcname);
                            }
                        }catch (error) {
                            console.error(error);
                            return askForId(user, dcname);
                        }
                        })
                        .catch(collected => {
                            reaction.message.channel.send('Tid Slut!');
                        });

                    })
                }
                askForId(user, dcname)
            }
        }else if (reaction.emoji.name == "❌") {
            if (state == 0) {
                state = 3
                reaction.message.channel.send(`${user}, Du Svarade Nej Till ${mcname}(s) Applikation Skriv Andlening Inom 30 Sekunder.`)
            }else if (state == 1) {
                reaction.message.channel.send(`Okej, Synd Att ${dcname} Inte fanns med i discorden. :(`)
            }
        }
    }
});

function whielistPlayer(mcname, dcid, dcMember, java) {
    let guild = client.guilds.cache.get('789222642044633129')
    let guildMember = guild.members.cache.find(user => user.id == (dcid))
    var role= guildMember.guild.roles.cache.find(role => role.name === "SMP Player");
    guildMember.roles.add(role);
    client.channels.cache.get("861289814799679489").send(`${dcMember} + SMP Player Rank`)
    dcMember.send(`Hej ${dcMember}! Kul att du har ansökt till servern. Vi vill bara informera dig om att du har kommit ni på servern :). 
    OBS: Vi hostar denna servern för att det ska vara roligt för dig och andra spelare så Förstör eller sno inte från andra spelare. 
    Detta kommer resultera i en Permament bannlysning från servern. 
    Vi har också ett kommando som alla kan använda "/co inspect" detta kommandot används för att se om någon snott något ur din kista eller snott ett block. 
    Kontakta admins genom att skapa en server ticket längst uppe i kanalen #hjälp-ticket. Med vänliga hälsningar från serverägarna av MooBloomSMP.`)
    client.channels.cache.get("861289814799679489").send(`DM:ade ${dcMember}!`)
    if (java) {
        client.channels.cache.get("789770852623188008").send(`whitelist add ${mcname}`)
    }else {
        client.channels.cache.get("789770852623188008").send(`fwhitelist add ${mcname}`)
    }
    client.channels.cache.get("861289814799679489").send(`Whitelistade ${mcname}`)
    state = -1
}


client.on('message', message => {
    if (message.channel.id == "861289814799679489") {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(/ +/)
        const command = args.shift().toLocaleLowerCase();

        if (command === 'update') {
            message.channel.send('Uppdaterar...')
            updateApplications()
        }
    }
});



client.login('...');
