const axios = require("axios");

module.exports.config = {
  name: "owner",
  version: "1",
  hasPermssion: 0,
  credits: "Aki Hayakawa",
  description: "Display owner",
  usePrefix: true,
  usages: "owner",
  commandCategory: "...",
  cooldowns: 0
};

module.exports.run = async ({ api, event }) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const link = `https://i.postimg.cc/J0tpTgMd/PfmmlIJ.gif`;
    const imagepath = path.join(__dirname, 'cache', 'owner.gif');
    const getImage = (await axios.get(`${link}`, {
      responseType: 'arraybuffer'
    })).data;
    fs.writeFileSync(imagepath, Buffer.from(getImage, "utf-8"));
    api.sendMessage({
        body: `Hello, I am created by Aki ❤️`,
        attachment: fs.createReadStream(imagepath)
      }, event.threadID, () => fs.unlinkSync(imagepath), event.messageID);
  } catch (error) {
    console.error("An error occurred:", error);
    api.sendMessage("Oops! Something went wrong.", event.threadID, event.messageID);
  }
};