module.exports.config = {
	name: "ai-img",
	version: "1.0.",
	hasPermssion: 0,
	credits: "Aki Hayakawa",
	description: "generate image from polination",
	usePrefix: true,
	commandCategory: "image",
	usages: "query",
	cooldowns: 2,
  };
  module.exports.run = async ({
	api,
	event,
	args
  }) => {
	const axios = require('axios');
	const fs = require('fs-extra');
	let {
		threadID,
		messageID
	} = event;
	let query = args.join(" ");
	if (!query) return api.sendMessage("put text/query", threadID, messageID);
	let path = __dirname + `/cache/ai-img.png`;
	const poli = (await axios.get(`https://www.samirxpikachu.run.place/imagine?prompt=${query}`, {
		responseType: "arraybuffer",
	})).data;
	fs.writeFileSync(path, Buffer.from(poli, "utf-8"));
	const userInfo = await api.getUserInfo(event.senderID);
	const userName = userInfo[event.senderID]?.name;
	api.sendMessage({
		body: `Here's your image ${userName}`,
		mentions: [{
		  tag: userName,
		  id: event.senderID
		}],
		attachment: fs.createReadStream(path)
	}, threadID, () => fs.unlinkSync(path), messageID);
  };