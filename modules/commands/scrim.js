const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Load configuration from the root directory
const configPath = path.join(__dirname, '../../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

module.exports.config = {
    name: 'scrim',
    version: '1.0.2',
    hasPermssion: 0,
    credits: 'Aki Hayakawa',
    description: 'Manage user list',
    commandCategory: 'Tools',
    usePrefix: true,
    usages: 'register <red|blue|spectator|random> [ML ID] | unregister | clear | list | time [time]',
    cooldowns: 2
};

const listFilePath = path.join(__dirname, 'cache', 'scrim.json');
let scrimTime = '';

module.exports.run = async function({ api, event, args }) {
    const command = args[0];
    let team = args[1]; // By default, team will be the second argument
    const mlID = args[args.length - 1]; // Mobile Legends ID is the last argument
    const mentionedUser = Object.keys(event.mentions)[0];
    const senderID = mentionedUser || event.senderID;
    const senderInfo = await api.getUserInfo(senderID);
    const senderName = mentionedUser ? event.mentions[mentionedUser].replace('@', '') : senderInfo[senderID]?.name;

    // Ensure the list file exists
    if (!fs.existsSync(listFilePath)) {
        fs.writeFileSync(listFilePath, JSON.stringify({ red: [], blue: [], spectator: [] }), 'utf8');
    }

    let scrimData = JSON.parse(fs.readFileSync(listFilePath, 'utf8'));

    switch (command) {
        case 'register':
            if (!team || team === 'random') {
                team = Math.random() < 0.5 ? 'red' : 'blue'; // Randomly assign to red or blue if no team specified or if 'random'
            } else if (!['red', 'blue', 'spectator'].includes(team)) {
                api.sendMessage(`Invalid team. Use register <red|blue|spectator|random> [ML ID].`, event.threadID, event.messageID);
                return;
            }

            if (!mlID || isNaN(mlID)) {
                api.sendMessage(`Please include a valid Mobile Legends ID.`, event.threadID, event.messageID);
                return;
            }

            // Remove user from any previous team
            for (let t of ['red', 'blue', 'spectator']) {
                scrimData[t] = scrimData[t].filter(name => name.split(' - ')[0] !== senderName);
            }

            // Check team capacity for red and blue teams (spectator team is unlimited)
            if ((team === 'red' || team === 'blue') && scrimData[team].length >= 5) {
                api.sendMessage(`${team.charAt(0).toUpperCase() + team.slice(1)} Team is already full.`, event.threadID, event.messageID);
                return;
            }

            scrimData[team].push(`${senderName} - ${mlID}`);
            fs.writeFileSync(listFilePath, JSON.stringify(scrimData), 'utf8');
            api.sendMessage(`${senderName} (${mlID}) has been registered in the ${team} team.`, event.threadID, event.messageID);
            break;

        case 'unregister':
            let teamFound = false;
            for (let t of ['red', 'blue', 'spectator']) {
                if (scrimData[t].some(name => name.split(' - ')[0] === senderName)) {
                    scrimData[t] = scrimData[t].filter(name => name.split(' - ')[0] !== senderName);
                    teamFound = true;
                    break;
                }
            }

            if (teamFound) {
                fs.writeFileSync(listFilePath, JSON.stringify(scrimData), 'utf8');
                api.sendMessage(`${senderName} has been unregistered.`, event.threadID, event.messageID);
            } else {
                api.sendMessage(`${senderName} is not registered in any team.`, event.threadID, event.messageID);
            }
            break;

        case 'clear':
            if (config.ADMINBOT.includes(senderID)) {
                scrimData = { red: [], blue: [], spectator: [] };
                scrimTime = '';
                fs.writeFileSync(listFilePath, JSON.stringify(scrimData), 'utf8');
                api.sendMessage(`The list has been cleared by admin.`, event.threadID, event.messageID);
            } else {
                api.sendMessage(`You do not have permission to clear the list.`, event.threadID, event.messageID);
            }
            break;

        case 'list':
            let response = `FLUX Mobile Legends Scrim${scrimTime ? ` @ ${scrimTime}` : ''}\n\nRED TEAM:\n`;
            for (let i = 0; i < 5; i++) {
                response += `${i + 1}. ${scrimData.red[i] ? scrimData.red[i] : ''}\n`;
            }
            response += `\nBLUE TEAM:\n`;
            for (let i = 0; i < 5; i++) {
                response += `${i + 1}. ${scrimData.blue[i] ? scrimData.blue[i] : ''}\n`;
            }
            response += `\nSPECTATORS:\n`;
            for (let i = 0; i < scrimData.spectator.length; i++) {
                response += `${i + 1}. ${scrimData.spectator[i]}\n`;
            }
            try {
                //const link = `https://i.postimg.cc/hPbxzL6C/scrim.png`;
                const link = `https://i.postimg.cc/P56s5bwy/flux-scrim.png`;
                const imagepath = path.join(__dirname, 'cache', 'scrim.png');
                const getImage = (await axios.get(`${link}`, {
                  responseType: 'arraybuffer'
                })).data;
                fs.writeFileSync(imagepath, Buffer.from(getImage, "utf-8"));
                api.sendMessage({
                    body: response,
                    attachment: fs.createReadStream(imagepath)
                  }, event.threadID, () => fs.unlinkSync(imagepath), event.messageID);
              } catch (error) {
                console.error("An error occurred:", error);
                api.sendMessage("Oops! Something went wrong.", event.threadID, event.messageID);
              }
            break;

        case 'time':
            if (config.ADMINBOT.includes(senderID)) {
                scrimTime = args.slice(1).join(' ');
                api.sendMessage(`Scrim time has been set to ${scrimTime}.`, event.threadID, event.messageID);
            } else {
                api.sendMessage(`You do not have permission to set the time.`, event.threadID, event.messageID);
            }
            break;

        case 'help':
            const helpMessage = `To register on a specific team, type:\n.scrim register <red|blue|spectator|random> [ML ID]\n\nExample:\n.scrim register blue 9752125\n\nTo unregister, type:\n.scrim unregister\n\nTo clear the list (Admin only), type:\n.scrim clear\n\nTo view the current list, type:\n.scrim list\n\nTo set scrim time (Admin only), type:\n.scrim time [time]`;
            api.sendMessage(helpMessage, event.threadID, event.messageID);
            break;

        default:
            api.sendMessage(`Invalid command. Use register <red|blue|spectator|random> [ML ID], unregister, clear, list, or time [time].`, event.threadID, event.messageID);
            break;
    }
};
