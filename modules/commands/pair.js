module.exports.config = {
    name: "pair",
    version: "1.0.0", 
    hasPermssion: 0,
    credits: "Aki Hayakawa",
   description: "Find your other partner",
    usePrefix: true,
    commandCategory: "fun", 
    cooldowns: 0
  };
  module.exports.run = async ({ event, api,Currencies }) => {
  const { threadID, messageID, senderID } = event;
  var data = await Currencies.getData(event.senderID);
  var money = data.money
  if( money < -0) api.sendMessage(`error?`,threadID,messageID)
    else {
    Currencies.setData(event.senderID, options = {money: money - 0})
    api.sendMessage(`In search of your perfect match?\nPlease react love '❤' to this message to continue`,threadID, (err, info) => {
      global.client.handleReaction.push({
        name: this.config.name, 
        messageID: info.messageID,
        author: event.senderID,
      })
      },event.messageID);
    }
  }
  module.exports.handleReaction = async ({ event, api, handleReaction, Currencies, Users}) => {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, userID } = event;
  if (event.userID != handleReaction.author) return;
  if (event.reaction != "❤") return; 
   api.unsendMessage(handleReaction.messageID);
   api.sendMessage(`⌛ Finding your perfect match`, threadID);
   var ThreadInfo = await api.getThreadInfo(event.threadID);
              var all = ThreadInfo.userInfo
              let data = [];
              for (let member of all) {
                  if (member.gender == "MALE") {
                   if ( member != event.senderID) data.push(member.id)   
                  }
                  if (member.gender == "FEMALE") {
                    if ( member != event.senderID) data.push(member.id)  
                }
              }
          let id = data[Math.floor(Math.random() * data.length)]
          // let ratio = (Math.random() * 50)+50;
          var name = (await Users.getData(id)).name
          var author = await Users.getNameUser(handleReaction.author);
          var ratio = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
          var match = ratio[Math.floor(Math.random() * ratio.length)];
    var arraytag = [];
          arraytag.push({id: handleReaction.author, tag: author});
          arraytag.push({id: id, tag: name});
         let Avatar_author = (await axios.get( `https://graph.facebook.com/${handleReaction.author}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" } )).data; 
              fs.writeFileSync( __dirname + "/cache/1.png", Buffer.from(Avatar_author, "utf-8") );
          let Avatar_member = (await axios.get( `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" } )).data;
              fs.writeFileSync( __dirname + "/cache/2.png", Buffer.from(Avatar_member, "utf-8") );
     var imglove = [];
                imglove.push(fs.createReadStream(__dirname + "/cache/1.png"));
                imglove.push(fs.createReadStream(__dirname + "/cache/2.png"));
          var msg = {body: `✅ Pair found!\nMatch: ${match}\n`+author+" "+"❤️"+" "+name, mentions: arraytag, attachment: imglove}
          return api.sendMessage(msg, threadID); 
  }