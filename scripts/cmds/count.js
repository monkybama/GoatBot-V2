module.exports = {
  config: {
    name: "احصاء",
    version: "1.3",
    author: "NTKhang",
    countDown: 5,
    role: 0,
    description: {
      vi: "Xem số lượng tin nhắn của tất cả thành viên hoặc bản thân (tính từ lúc bot vào nhóm)",
      en: "View the number of messages of all members or yourself (since the bot joined the group)"
    },
    category: "box chat",
    guide: {
      vi: "   {pn}: dùng để xem số lượng tin nhắn của bạn" +
        "\n   {pn} @tag: dùng để xem số lượng tin nhắn của những người được tag" +
        "\n   {pn} all: dùng để xem số lượng tin nhắn của tất cả thành viên",
      en: " {pn}: لعرض عدد رسائلك الخاصة" + "\n {pn} @الإشارة: لعرض إحصائيات رسائل الأعضاء المشار إليهم" + "\n {pn} الكل: لعرض إحصائيات رسائل جميع أعضاء المجموعة"
      
    }
  },
  
  langs: {
    vi: {
      count: "Số tin nhắn của các thành viên:",
      endMessage: "Những người không có tên trong danh sách là chưa gửi tin nhắn nào.",
      page: "Trang [%1/%2]",
      reply: "Phản hồi tin nhắn này kèm số trang để xem tiếp",
      result: "%1 hạng %2 với %3 tin nhắn",
      yourResult: "Bạn đứng hạng %1 và đã gửi %2 tin nhắn trong nhóm này",
      invalidPage: "Số trang không hợp lệ"
    },
    en: {
      count: "عدد الرسائل من الأعضاء:",
      endMessage: "الأعضاء الغير مدرجين لم يرسلوا أي رسائل حتى الآن.",
      page: "الصفحة [%1 من %2]",
      reply: "الرد على هذه الرسالة برقم الصفحة المطلوبة",
      result: "المرتبة %2 لـ %1 مع %3 رسالة",
      yourResult: "موقعك في الترتيب %1 وقد أرسلت %2 رسالة في هذه المجموعة",
      invalidPage: "رقم الصفحة المدخل غير صالح"
      
      
    }
  },
  
  onStart: async function({ args, threadsData, message, event, api, commandName, getLang }) {
    const { threadID, senderID } = event;
    const threadData = await threadsData.get(threadID);
    const { members } = threadData;
    const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
    let arraySort = [];
    for (const user of members) {
      if (!usersInGroup.includes(user.userID))
        continue;
      const charac = "️️️️️️️️️️️️️️️️️"; // This character is banned from facebook chat (it is not an empty string)
      arraySort.push({
        name: user.name.includes(charac) ? `Uid: ${user.userID}` : user.name,
        count: user.count,
        uid: user.userID
      });
    }
    let stt = 1;
    arraySort.sort((a, b) => b.count - a.count);
    arraySort.map(item => item.stt = stt++);
    
    if (args[0]) {
      if (args[0].toLowerCase() == "all") {
        let msg = getLang("count");
        const endMessage = getLang("endMessage");
        for (const item of arraySort) {
          if (item.count > 0)
            msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
        }
        
        if ((msg + endMessage).length > 19999) {
          msg = "";
          let page = parseInt(args[1]);
          if (isNaN(page))
            page = 1;
          const splitPage = global.utils.splitPage(arraySort, 50);
          arraySort = splitPage.allPage[page - 1];
          for (const item of arraySort) {
            if (item.count > 0)
              msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
          }
          msg += getLang("page", page, splitPage.totalPage) +
            `\n${getLang("reply")}` +
            `\n\n${endMessage}`;
          
          return message.reply(msg, (err, info) => {
            if (err)
              return message.err(err);
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              splitPage,
              author: senderID
            });
          });
        }
        message.reply(msg);
      }
      else if (event.mentions) {
        let msg = "";
        for (const id in event.mentions) {
          const findUser = arraySort.find(item => item.uid == id);
          msg += `\n${getLang("result", findUser.name, findUser.stt, findUser.count)}`;
        }
        message.reply(msg);
      }
    }
    else {
      const findUser = arraySort.find(item => item.uid == senderID);
      return message.reply(getLang("yourResult", findUser.stt, findUser.count));
    }
  },
  
  onReply: ({ message, event, Reply, commandName, getLang }) => {
    const { senderID, body } = event;
    const { author, splitPage } = Reply;
    if (author != senderID)
      return;
    const page = parseInt(body);
    if (isNaN(page) || page < 1 || page > splitPage.totalPage)
      return message.reply(getLang("invalidPage"));
    let msg = getLang("count");
    const endMessage = getLang("endMessage");
    const arraySort = splitPage.allPage[page - 1];
    for (const item of arraySort) {
      if (item.count > 0)
        msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
    }
    msg += getLang("page", page, splitPage.totalPage) +
      "\n" + getLang("reply") +
      "\n\n" + endMessage;
    message.reply(msg, (err, info) => {
      if (err)
        return message.err(err);
      message.unsend(Reply.messageID);
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        splitPage,
        author: senderID
      });
    });
  },
  
  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    const members = await threadsData.get(threadID, "members");
    const findMember = members.find(user => user.userID == senderID);
    if (!findMember) {
      members.push({
        userID: senderID,
        name: await usersData.getName(senderID),
        nickname: null,
        inGroup: true,
        count: 1
      });
    }
    else
      findMember.count += 1;
    await threadsData.set(threadID, members, "members");
  }
  
};
