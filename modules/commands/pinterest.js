// module.exports.config = {
//     name: "pinterest",
//     version: "1.0.0",
//     hasPermssion: 0,
//     credits: "Aki Hayakawa",
//     description: "Image search",
//     usePrefix: true,
//     commandCategory: "Search",
//     usages: "[Text]",
//     cooldowns: 0,
// };
// module.exports.run = async function({ api, event, args }) {
//     const axios = require("axios");
//     const fs = require("fs-extra");
//     const request = require("request");
//     const keySearch = args.join(" ");
//     if(keySearch.includes("-") == false) return api.sendMessage(`Please enter in this format:\n${global.config.PREFIX}pinterest Naruto - 10\n\nYou can specify how many images you want to appear in the result with a maximum of 10.`, event.threadID, event.messageID)
//     const keySearchs = keySearch.substr(0, keySearch.indexOf('-'))
//     let numberSearch = keySearch.split("-").pop() || 6;
//     if (keySearch.split("-").pop() > 10) {
//         api.sendMessage(`You requested for${numberSearch} which exceeds the limit of 10. Sending you 10 results instead.`, event.threadID, event.messageID);
//     }
//     numberSearch = Math.min(numberSearch, 10);
//     const res = await axios.get(`https://api-dien.kira1011.repl.co/pinterest?search=${encodeURIComponent(keySearchs)}`);
//     const data = res.data.data;
//     var num = 0;
//     var imgData = [];
//     for (var i = 0; i < parseInt(numberSearch); i++) {
//       let path = __dirname + `/cache/${num+=1}.jpg`;
//       let getDown = (await axios.get(`${data[i]}`, { responseType: 'arraybuffer' })).data;
//       fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
//       imgData.push(fs.createReadStream(__dirname + `/cache/${num}.jpg`));
//     }
//     api.sendMessage({
//         attachment: imgData,
//         body: numberSearch + ' search results for keyword: '+ keySearchs
//     }, event.threadID, event.messageID)
//     for (let ii = 1; ii < parseInt(numberSearch); ii++) {
//         fs.unlinkSync(__dirname + `/cache/${ii}.jpg`)
//     }
// };

module.exports.config = {
    name: "pinterest",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Aki Hayakawa",
    description: "Image search",
    usePrefix: true,
    commandCategory: "Search",
    usages: "[Text]",
    cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const axios = require("axios");
    const fs = require("fs-extra");
    const keySearch = args.join(" ");

    if(!keySearch){
      return api.sendMessage("Search query cannot be blank!", event.threadID, event.messageID);
    }
    
    // Set the default number of search results to 9
    const numberSearch = 9;

    const res = await axios.get(`https://www.samirxpikachu.run.place/pinterest?query=${encodeURIComponent(keySearch)}&number=${numberSearch}`);
    api.sendMessage({
      body: `Sending images. Please wait ✅`
    }, event.threadID, event.messageID);
    const data = res.data.result;
    var num = 0;
    var imgData = [];
    for (var i = 0; i < parseInt(numberSearch); i++) {
      let path = __dirname + `/cache/${num+=1}.jpg`;
      let getDown = (await axios.get(`${data[i]}`, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
      imgData.push(fs.createReadStream(__dirname + `/cache/${num}.jpg`));
    }
    
    api.sendMessage({
        attachment: imgData,
        body: 'Search results for '+ keySearch
    }, event.threadID, event.messageID)
    for (let ii = 1; ii < parseInt(numberSearch); ii++) {
        fs.unlinkSync(__dirname + `/cache/${ii}.jpg`)
    }
  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("An unexpected error occurred while processing the request.", event.threadID, event.messageID);
  }
};
