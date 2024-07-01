module.exports.config = {
  name: "shoti",
  version: "1.0.0",
  credits: "Aki Hayakawa",
  description: "Generate random tiktok girl videos",
  hasPermssion: 0,
  commandCategory: "other",
  usage: "[shoti]",
  cooldowns: 60,
  dependencies: [],
  usePrefix: true
};

module.exports.run = async function({ api, event }) {
  
  const axios = require("axios");
  const request = require('request');
  const fs = require("fs");

  try {
    api.sendMessage(`✅ Processing your request. Please wait`, event.threadID, event.messageID);
    let data = await axios.get('https://shoti-srv1.onrender.com/api/v1/request-f');
    var file = fs.createWriteStream(__dirname + "/cache/shoti.mp4");
    var rqs = request(encodeURI(data.data.data.url));
    let filePath = __dirname + "/cache/shoti.mp4";
    rqs.pipe(file);
    file.on('finish', async () => {
      api.sendMessage({
        attachment: fs.createReadStream(__dirname + '/cache/shoti.mp4')
      }, event.threadID, async () => {
        // After sending the message, delete the video file
        try {
          await fs.promises.unlink(filePath);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }, event.messageID);
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
