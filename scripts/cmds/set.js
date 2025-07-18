module.exports = {
  config: {
    name: "تعيين",
    aliases: ['ap'],
    version: "1.0",
    author: "Loid Butter",
    role: 0,
    shortDescription: {
      en: "Set coins and experience points for a user"
    },
    longDescription: {
      en: "Set coins and experience points for a user as desired"
    },
    category: "economy",
    guide: {
      en: "{pn}set [money|exp] [amount]"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const permission = ["100080355760429"];
  if (!permission.includes(event.senderID)) {
    api.sendMessage("𝐃𝐞𝐬𝐨𝐥𝐞 𝐭'𝐞𝐬 𝐭𝐫𝐨𝐩 𝐟𝐚𝐢𝐛𝐥𝐞 𝐩𝐨𝐮𝐫 𝐮𝐭𝐢𝐥𝐢𝐬𝐞 𝐜𝐞𝐭𝐭𝐞 𝐭𝐞𝐜𝐡𝐧𝐢𝐪𝐮𝐞 🐦.", event.threadID, event.messageID);
    return;
  }
    const query = args[0];
    const amount = parseInt(args[1]);

    if (!query || !amount) {
      return api.sendMessage("Invalid command arguments. Usage: set [query] [amount]", event.threadID);
    }

    const { messageID, senderID, threadID } = event;

    if (senderID === api.getCurrentUserID()) return;

    let targetUser;
    if (event.type === "message_reply") {
      targetUser = event.messageReply.senderID;
    } else {
      const mention = Object.keys(event.mentions);
      targetUser = mention[0] || senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage("User not found.", threadID);
    }

    const name = await usersData.getName(targetUser);

    if (query.toLowerCase() === 'exp') {
      await usersData.set(targetUser, {
        money: userData.money,
        exp: amount,
        data: userData.data
      });

      return api.sendMessage(`Set experience points to ${amount} for ${name}.`, threadID);
    } else if (query.toLowerCase() === 'money') {
      await usersData.set(targetUser, {
        money: amount,
        exp: userData.exp,
        data: userData.data
      });

      return api.sendMessage(`Set coins to ${amount} for ${name}.`, threadID);
    } else {
      return api.sendMessage("Invalid query. Use 'exp' to set experience points or 'money' to set coins.", threadID);
    }
  }
};
