module.exports = {
	config: {
		name: "لفل",
    aliases: ["la"],
		version: "1.0",
		author: "otiney fix by kivv",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "",
			en: ""
		},
		longDescription: {
			vi: "",
			en: "  "
		},
		category: "owner",
		guide: {
			vi: "",
			en: ""
    }
 },
  onStart: async function ({ api, args, message, event }) {
    const threadList = await api.getThreadList(10, null, ["INBOX"]);
    const botUserID = api.getCurrentUserID();
    threadList.forEach(threadInfo => {
        if (threadInfo.isGroup && threadInfo.threadID !== event.threadID) {
            api.removeUserFromGroup(botUserID, threadInfo.threadID);
        }
    });
}
}    
