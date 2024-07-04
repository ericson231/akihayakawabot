module.exports.config = {
  name: "toon",
  version: "1.0",
  hasPermssion: 0,
  credits: "Aki Hayakawa",
  description: "cartoonize yourself",
  usePrefix: true,
  commandCategory: "image",
  usages: "query",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  let { threadID, messageID, messageReply, attachments } = event;

  // Check if there is an image attachment or a replied message with an image
  if (!messageReply && (!attachments || attachments.length === 0)) {
    api.setMessageReaction('👎', messageID);
    return api.sendMessage('Please reply to an image or attach an image.', threadID, messageID);
  }

  // Get the image URL from the attachment or the replied message
  const imageUrl = messageReply ? messageReply.attachments[0].url : attachments[0].url;
  const encodedImageUrl = encodeURIComponent(imageUrl);
  const path = __dirname + `/cache/toon.png`;

  try {
    // Fetch the cartoonized image
    const toon = (await axios.get(`https://samirxpikachu.onrender.com/cartoon?url=${encodedImageUrl}&model=5&apikey=richixsamir`, {
      responseType: 'arraybuffer',
    })).data;

    // Save the image to a file
    fs.writeFileSync(path, Buffer.from(toon, 'utf-8'));

    // Get the user info
    const userInfo = await api.getUserInfo(event.senderID);
    const userName = userInfo[event.senderID]?.name;

    // Send the cartoonized image as a message
    api.sendMessage({
      body: `Here's your image, ${userName}`,
      mentions: [{
        tag: userName,
        id: event.senderID,
      }],
      attachment: fs.createReadStream(path),
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage('An error occurred while processing your request.', threadID, messageID);
  }
};
