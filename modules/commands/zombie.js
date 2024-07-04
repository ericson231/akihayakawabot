module.exports.config = {
  name: "zombie",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Aki Hayakawa",
  description: "",
  usePrefix: true,
  commandCategory: "tools",
  usages: "zombie",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const axios = require("axios");
  const fs = require("fs");
  const path = require("path");

  const { messageReply, threadID, messageID, attachments } = event;

  let imageUrl;

  if (attachments.length >= 1) {
    imageUrl = attachments[0].url;
  } else if (messageReply && messageReply.attachments.length >= 1) {
    imageUrl = messageReply.attachments[0].url;
  } else {
    api.setMessageReaction(`👎`, event.messageID);
    return api.sendMessage(
      "Please reply with a single image attachment or attach an image.",
      threadID,
      messageID
    );
  }

  const encodedImageUrl = encodeURIComponent(imageUrl);

  api.sendMessage('Processing image. Please wait ✅', event.threadID, event.messageID);

  const url = `https://samirxpikachu.onrender.com/zombie?imgurl=${encodedImageUrl}`;
  try {
    const download = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const imgpath = path.join(__dirname, "cache", `zombie.png`);
    fs.writeFileSync(imgpath, Buffer.from(download.data, "utf-8"));

    api.sendMessage(
      {
        attachment: fs.createReadStream(imgpath),
      },
      threadID,
      () => fs.unlinkSync(imgpath),
      messageID
    );
  } catch (error) {
    console.error("Error while downloading image:", error);
    api.sendMessage(
      "An error occurred while processing the image. Please try again later.",
      threadID,
      messageID
    );
  }
};
