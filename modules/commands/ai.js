const axios = require("axios");
let fontEnabled = false;

module.exports.config = {
  name: "ai",
  version: "1",
  usePrefix: true,
  hasPermission: 0,
  credits: "Aki Hayakawa",
  description: "Search using gemini",
  commandCategory: "ai",
  usages: "<ask>",
  cooldowns: 5,
};

async function convertImageToCaption(imageURL, api, event, inputText) {
  try {
    api.sendMessage("Generating response ✅", event.threadID, event.messageID);

    const response = await axios.get(`https://joshweb.click/gemini?prompt=${encodeURIComponent(inputText)}&url=${encodeURIComponent(imageURL)}`);
    const caption = response.data.gemini;

    if (caption) {
      let formattedCaption = formatFont(caption);
      formattedCaption = formattedCaption.replace(/\n\[Image of .*?\]|(\*\*)/g, '').replace(/^\*/gm, '•');
      api.sendMessage(`${formattedCaption}`, event.threadID, event.messageID);
    } else {
      api.sendMessage("Failed to recognize image.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error("Error while recognizing image:", error);
    api.sendMessage("An error occurred while recognizing the image.", event.threadID, event.messageID);
  }
}

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body || !global.config.PREFIX) return;

  if (!(event.body.toLowerCase().startsWith(`${global.config.PREFIX}ai`))) return;

  const args = event.body.split(/\s+/);
  args.shift();

  if (event.type === "message_reply") {
    if (event.messageReply.attachments[0]) {
      const attachment = event.messageReply.attachments[0];

      if (attachment.type === "photo") {
        const imageURL = attachment.url;
        convertImageToCaption(imageURL, api, event, args.join(' '));
        return;
      }
    }
  }

  const inputText = args.join(' ');

  if (!inputText && (!event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== "photo")) {
    return api.sendMessage("Hello, I'm Gemini Pro Vision by Aki. How may I help you?", event.threadID, event.messageID);
  }

  if (args[0] === "on") {
    fontEnabled = true;
    api.sendMessage({ body: "Gemini P-Vision AI Font Formatting Enabled" }, event.threadID, event.messageID);
    return;
  }

  if (args[0] === "off") {
    fontEnabled = false;
    api.sendMessage({ body: "Gemini P-Vision AI Font Formatting Disabled" }, event.threadID, event.messageID);
    return;
  }

  api.sendMessage("Generating response ✅", event.threadID, event.messageID);

  try {
    var uid = event.senderID;
    const response = await axios.get(`https://samirxpikachu.onrender.com/gpt?content=${encodeURIComponent(inputText)}`);
    if (response.status === 200) {
      let formattedResponse = formatFont(response.data.message.content);
      formattedResponse = formattedResponse.replace(/\n\[Image of .*?\]|(\*\*)/g, '').replace(/^\*/gm, '•');
      api.sendMessage(`${formattedResponse}`, event.threadID, event.messageID);
    } else {
      console.error("Error generating response from API");
    }
  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("An error occurred while processing response", event.threadID, event.messageID);
  }
};

function formatFont(text) {
  return text;
}

module.exports.run = async function ({ api, event }) {};
