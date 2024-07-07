// module.exports.config = {
//     name: "swap",
//     version: "1.0.0",
//     hasPermssion: 0,
//     credits: "Aki Hayakawa",
//     description: "Swap faces between two images",
//     usePrefix: true,
//     commandCategory: "tools",
//     usages: "swap",
//     cooldowns: 5,
//   };
  
//   module.exports.run = async function ({ api, event }) {
//     const axios = require("axios");
//     const fs = require("fs");
//     const path = require("path");

//     const { Prodia } = require("prodia.js");
//     const { faceSwap, wait } = Prodia("b3e98d28-010f-456a-ac80-7c9535acbf4b");
  
//     const { messageReply, threadID, messageID, attachments } = event;
  
//     let imageUrl1, imageUrl2;
  
//     if (attachments.length >= 2) {
//       imageUrl1 = attachments[0].url;
//       imageUrl2 = attachments[1].url;
//     } else if (messageReply && messageReply.attachments.length >= 2) {
//       imageUrl1 = messageReply.attachments[0].url;
//       imageUrl2 = messageReply.attachments[1].url;
//     } else {
//       api.setMessageReaction(`👎`, event.messageID);
//       return api.sendMessage(
//         "Please reply with a set of two image attachments or attach two images.",
//         threadID,
//         messageID
//       );
//     }
  
//     const encodedImageUrl1 = encodeURIComponent(imageUrl1);
//     const encodedImageUrl2 = encodeURIComponent(imageUrl2);

//     api.sendMessage('Swapping faces. Please wait ✅', event.threadID, event.messageID);
  
//     const apiUrl = `https://samirxpikachu.onrender.com/faceswap?sourceUrl=${encodedImageUrl1}&targetUrl=${encodedImageUrl2}`;
//     try {
//       const downloadSwap = await axios.get(apiUrl, {
//         responseType: "arraybuffer",
//       });
//       const swapPath = path.join(__dirname, "cache", `swap.png`);
//       fs.writeFileSync(swapPath, Buffer.from(downloadSwap.data, "utf-8"));
  
//       api.sendMessage(
//         {
//           attachment: fs.createReadStream(swapPath),
//         },
//         threadID,
//         () => fs.unlinkSync(swapPath),
//         messageID
//       );
//     } catch (error) {
//       console.error("Error while downloading swap:", error);
//       api.sendMessage(
//         "An error occurred while processing the images. Please try again later.",
//         threadID,
//         messageID
//       );
//     }
//   };
  

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
  const { Prodia } = require("prodia.js");
  const { faceSwap, wait } = Prodia("b3e98d28-010f-456a-ac80-7c9535acbf4b");

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

  api.sendMessage('Swapping faces. Please wait ✅', event.threadID, event.messageID);

  try {
    const input = async ({ sourceUrl, targetUrl }) => {
      const result = await faceSwap({
        sourceUrl,
        targetUrl,
      });

      return await wait(result);
    };

    const result = await input({
      sourceUrl: imageUrl1,
      targetUrl: imageUrl2,
    });

    const swapImageUrl = result.imageUrl;

    const downloadSwap = await axios.get(swapImageUrl, {
      responseType: "arraybuffer",
    });
    const swapPath = path.join(__dirname, "cache", `swap.png`);
    fs.writeFileSync(swapPath, Buffer.from(downloadSwap.data, "utf-8"));

    api.sendMessage(
      {
        attachment: fs.createReadStream(swapPath),
      },
      threadID,
      () => {
        if (fs.existsSync(swapPath)) {
          fs.unlinkSync(swapPath);
        }
      },
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

