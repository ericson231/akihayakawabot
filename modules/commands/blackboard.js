module.exports.config = {
	name: "blackboard",
	version: "1.0.1",
	hasPermission: 0,
	usePrefix: true,
	credits: "Aki Hayakawa",
	description: "write something on blackboard",
	commandCategory: "Edit-IMG",
	usages: "blackboard [text]",
	cooldowns: 10,
	dependencies: {
		"canvas": "",
		"axios": "",
		"fs-extra": ""
	}
};

module.exports.wrapText = (ctx, text, maxWidth) => {
	return new Promise(resolve => {
		if (ctx.measureText(text).width < maxWidth) return resolve([text]);
		if (ctx.measureText('W').width > maxWidth) return resolve(null);
		const words = text.split(' ');
		const lines = [];
		let line = '';
		while (words.length > 0) {
			let split = false;
			while (ctx.measureText(words[0]).width >= maxWidth) {
				const temp = words[0];
				words[0] = temp.slice(0, -1);
				if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
				else {
					split = true;
					words.splice(1, 0, temp.slice(-1));
				}
			}
			if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
			else {
				lines.push(line.trim());
				line = '';
			}
			if (words.length === 0) lines.push(line.trim());
		}
		return resolve(lines);
	});
}

module.exports.run = async function({ api, event, args }) {
	let { senderID, threadID, messageID } = event;
	const { loadImage, createCanvas } = require("canvas");
	const fs = global.nodemodule["fs-extra"];
	const axios = global.nodemodule["axios"];
	let pathImg = __dirname + '/cache/bang.png';// change the file name as desired
	var text = args.join(" ");
	if (event.type === "message_reply"){
        text = event.messageReply.body;
    }
	if (!text) return api.sendMessage("Enter the content to comment on the board", threadID, messageID);
	// let getImage = (await axios.get(`https://i.imgur.com/Jl7sYMm.jpeg`, { responseType: 'arraybuffer' })).data; // image link
	let getImage = (await axios.get(`https://i.postimg.cc/C5G6n2HZ/image.png`, { responseType: 'arraybuffer' })).data; // image link
	fs.writeFileSync(pathImg, Buffer.from(getImage, 'utf-8'));
	let baseImage = await loadImage(pathImg);
	let canvas = createCanvas(baseImage.width, baseImage.height);
	let ctx = canvas.getContext("2d");
	ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
	ctx.font = "bold 20px Valera";
	ctx.fillStyle = "#FFFFFF";
	ctx.textAlign = "start";
	let fontSize = 20;
	while (ctx.measureText(text).width > 2250) {
		fontSize--;
		ctx.font = `bold ${fontSize}px Valera, sans-serif`;
	}
	const lines = await this.wrapText(ctx, text, 440);
	ctx.fillText(lines.join('\n'), 85,100);// comment position
	ctx.beginPath();
	const imageBuffer = canvas.toBuffer();
	fs.writeFileSync(pathImg, imageBuffer);
	return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => fs.unlinkSync(pathImg), messageID);        
}
