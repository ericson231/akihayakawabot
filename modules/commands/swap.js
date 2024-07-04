module.exports.config = {
    name: "swap",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Aki Hayakawa",
    description: "Swap faces between two images",
    usePrefix: true,
    commandCategory: "tools",
    usages: "swap",
    cooldowns: 5,
  };
  
  module.exports.run = async function ({ api, event }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");
  
    const { messageReply, threadID, messageID, attachments } = event;
  
    let imageUrl1, imageUrl2;
  
    if (attachments.length >= 2) {
      imageUrl1 = attachments[0].url;
      imageUrl2 = attachments[1].url;
    } else if (messageReply && messageReply.attachments.length >= 2) {
      imageUrl1 = messageReply.attachments[0].url;
      imageUrl2 = messageReply.attachments[1].url;
    } else {
      api.setMessageReaction(`👎`, event.messageID);
      return api.sendMessage(
        "Please reply with a set of two image attachments or attach two images.",
        threadID,
        messageID
      );
    }
  
    const encodedImageUrl1 = encodeURIComponent(imageUrl1);
    const encodedImageUrl2 = encodeURIComponent(imageUrl2);

    api.sendMessage('Swapping faces. Please wait ✅', event.threadID, event.messageID);
  
    const apiUrl = `https://samirxpikachu.onrender.com/faceswap?sourceUrl=${encodedImageUrl1}&targetUrl=${encodedImageUrl2}`;
    try {
      const downloadSwap = await axios.get(apiUrl, {
        responseType: "arraybuffer",
      });
      const swapPath = path.join(__dirname, "cache", `swap.png`);
      fs.writeFileSync(swapPath, Buffer.from(downloadSwap.data, "utf-8"));
  
      api.sendMessage(
        {
          attachment: fs.createReadStream(swapPath),
        },
        threadID,
        () => fs.unlinkSync(swapPath),
        messageID
      );
    } catch (error) {
      console.error("Error while downloading swap:", error);
      api.sendMessage(
        "An error occurred while processing the images. Please try again later.",
        threadID,
        messageID
      );
    }
  };
  