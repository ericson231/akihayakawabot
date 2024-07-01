const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'pairv4',
  version: '1.0.0',
  hasPermission: 0,
  credits: 'Aki Hayakawa',
  description: 'Pair v2',
  usePrefix: true,
  commandCategory: 'fun',
  usages: '',
  cooldowns: 0,
};

module.exports.run = async function ({
  api,
  event,
  args,
  Users,
  Threads,
  Currencies,
}) {
  try {
    const tl = [
      '21%',
      '67%',
      '19%',
      '37%',
      '17%',
      '96%',
      '52%',
      '62%',
      '76%',
      '83%',
      '100%',
      '99%',
      '0%',
      '48%',
    ];
    const tle = tl[Math.floor(Math.random() * tl.length)];

    const userData = await api.getUserInfo(event.senderID);
    const namee = userData[event.senderID].name;

    const threadInfo = await api.getThreadInfo(event.threadID);
    const participantIDs = threadInfo.participantIDs;
    const id = participantIDs[Math.floor(Math.random() * participantIDs.length)];

    const partnerData = await api.getUserInfo(id);
    const name = partnerData[id].name;

    api.changeNickname(`${name}'s property 🔒❤️`, event.threadID, event.senderID);
    api.changeNickname(`${namee}'s property ❤️🔒`, event.threadID, id);

    const sex = partnerData[id].gender;
    const gender = sex === 2 ? 'Male' : sex === 1 ? 'Female' : 'Unknown';

    const [avatar1, avatar2] = await Promise.all([
      axios.get(`https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: 'arraybuffer',
      }),
      axios.get(`https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: 'arraybuffer',
      }),
    ]);

    const avt1 = path.join(__dirname, 'cache', 'avt1.png');
    const avt2 = path.join(__dirname, 'cache', 'avt2.png');

    fs.writeFileSync(avt1, Buffer.from(avatar1.data, 'utf-8'));
    fs.writeFileSync(avt2, Buffer.from(avatar2.data, 'utf-8'));

    const imglove = [
      fs.createReadStream(avt1),
      fs.createReadStream(avt2),
    ];

    const message = {
      body: `Pairing successful!\nYour partner's gender: ${gender}\nMatch: ${tle}\n${namee} ❤️ ${name}`,
      mentions: [
        {
          id: event.senderID,
          tag: namee,
        },
        {
          id: id,
          tag: name,
        },
      ],
      attachment: imglove,
    };

    api.sendMessage(message, event.threadID, () => {
      fs.unlinkSync(avt1);
      fs.unlinkSync(avt2);
    }, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage('An error occurred while processing your request.', event.threadID);
  }
};
