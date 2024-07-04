// module.exports.config = {
//   name: "art",
//   version: "1.0.0",
//   hasPermssion: 0,
//   credits: "Aki Hayakawa",
//   description: "Anime filter",
//   usePrefix: true,
//   commandCategory: "image",
//   usages: "[reply to image or image url]",
//   cooldowns: 1,
// };
// const axios = require("axios")
// const fs = require("fs");
// module.exports.run = async function({ api, event, args }) {
// const { threadID, messageID } = event;
// if (event.type == "message_reply"){
// var t = event.messageReply.attachments[0].url
// } else {
// var t = args.join(" ");
// }
// try {
// api.sendMessage("Generating image. Please wait ✅", threadID, messageID);
//   const r = await axios.get("https://free-api.ainz-sama101.repl.co/canvas/toanime?", {
//               params: {
//                   url: encodeURI(t)
//   }
// });
// const result = r.data.result.image_data;
//   let ly = __dirname+"/cache/anime.png";
//   let ly1 = (await axios.get(result, {
//   responseType: "arraybuffer"
// })).data;
// fs.writeFileSync(ly, Buffer.from(ly1, "utf-8"));
//   return api.sendMessage({attachment: fs.createReadStream(ly)}, threadID, () => fs.unlinkSync(ly), messageID)
// } catch (e){
//       console.log(e.message);
//         return api.sendMessage("Something went wrong.\n"+e.message, threadID, messageID)
//  }
// }

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { toanime } = require('betabotz-tools');

module.exports.config = {
    name: 'art',
    version: '1.0.1',
    credits: 'Aki Hayakawa',
    hasPermission: 0,
    usePrefix: true,
    description: 'Create an art version of an image',
    commandCategory: 'image',
    usages: '[reply to an image]',
    cooldowns: 0,
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

    async function convertToAnime() {
        try {
            const results = await toanime(imageUrl);
            const artpath = path.join(__dirname, 'cache', 'art.png');
            const imageData = results.image_data; // Store the image_data URL in a variable
            const downloadLink = (await axios.get(`${imageData}`, {
                responseType: 'arraybuffer',
              })).data;
            fs.writeFileSync(artpath, Buffer.from(downloadLink, 'utf-8'));

            api.sendMessage({
                body: `Here's your image, ${userName}`,
                mentions: [{
                  tag: userName,
                  id: event.senderID,
                }],
                attachment: fs.createReadStream(artpath),
              }, threadID, () => fs.unlinkSync(artpath), messageID);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Call the async function
    convertToAnime();    
}