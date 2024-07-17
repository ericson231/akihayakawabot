const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { remini } = require('betabotz-tools');

module.exports.config = {
    name: 'remini',
    version: '1.0.1',
    credits: 'Aki Hayakawa',
    hasPermission: 0,
    usePrefix: true,
    description: 'Remini an image',
    commandCategory: 'image',
    usages: '[reply to an image]',
    cooldowns: 5,
};
module.exports.run = async function ({
    api,
    event
}) {
    const {
        messageReply,
        threadID,
        messageID,
        attachments
    } = event;
    if (!messageReply && attachments.length === 0) {
        api.setMessageReaction(`👎`, event.messageID);
        return api.sendMessage('Please reply to an image or attach an image.', threadID, messageID);
    }
    api.sendMessage('Processing image. Please wait ✅', event.threadID, event.messageID);
    const imageUrl = messageReply ? messageReply.attachments[0].url : attachments[0].url;
    const userInfo = await api.getUserInfo(event.senderID);
    const userName = userInfo[event.senderID]?.name;

    async function reminify() {
        try {
            const results = await remini(imageUrl);
            const reminipath = path.join(__dirname, 'cache', 'remini.png');
            const imageData = results.image_data; // Store the image_data URL in a variable
            const downloadLink = (await axios.get(`${imageData}`, {
                responseType: 'arraybuffer',
              })).data;
            fs.writeFileSync(reminipath, Buffer.from(downloadLink, 'utf-8'));

            api.sendMessage({
                body: `Here's your image, ${userName}`,
                mentions: [{
                  tag: userName,
                  id: event.senderID,
                }],
                attachment: fs.createReadStream(reminipath),
              }, threadID, () => fs.unlinkSync(reminipath), messageID);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Call the async function
    reminify();    
}