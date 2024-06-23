const bot = require("./config.js");

const fs = require("fs");
const path = require("path");

const appState = require("./state.js");

const { Op } = require("sequelize");
const { Achievements, Users } = require("./models");

const {
  mainMenuOptions,
  backToMainMenuOptions,
  cancelMenuOptions,
  adminMainMenuOptions,
} = require("./options.js");

const mainMenuView = async (chatId, messageId, message) => {
  appState.resetAppState();
  const isAdmin = appState.user.isAdmin;
  if (messageId) {
    return await bot.editMessageText(message, {
      message_id: messageId,
      chat_id: chatId,
      ...(isAdmin ? adminMainMenuOptions : mainMenuOptions),
    });
  } else {
    return await bot.sendMessage(
      chatId,
      message,
      isAdmin ? adminMainMenuOptions : mainMenuOptions
    );
  }
};

const clearChat = async (msg) => {
  for (let i = 0; i < 101; i++) {
    await bot.deleteMessage(msg.chat.id, msg.message_id - i).catch((er) => {
      return;
    });
  }
  if (!appState.user.fullName) return await auth();
  return await mainMenuView(
    msg.chat.id,
    undefined,
    `Добро пожаловать, ${appState.user.fullName}!`
  );
};

const deleteFile = async (filePath) => {
  await fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Ошибка при удалении файла ${filePath}:`, err);
    } else {
      console.log(`Файл ${filePath} успешно удалён.`);
    }
  });
};

const showAchievments = async (chatId, achievments) => {
  if (achievments.length === 0) {
    bot.sendMessage(chatId, `Ничего не найдено`, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: "В меню", callback_data: "back" }],
          [
            {
              text: "Продолжить поиск",
              callback_data: "search",
            },
          ],
        ],
      }),
    });
  } else {
    for (let i = 0; i < achievments.length; i++) {
      await bot.sendDocument(
        chatId,
        path.resolve(__dirname, "static", achievments[i].doc),
        {
          caption: `${achievments[i].date}\nДостижение: ${
            achievments[i].achievement
          }\nУченик: ${achievments[i].user.fullName}\nГруппа: ${
            achievments[i].user.group
          }${
            achievments[i].isApproved === null
              ? "\nНА РАССМОТРЕНИИ"
              : achievments[i].isApproved
              ? ""
              : "\nОТКЛОНЁН"
          }`,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              appState.user.id === chatId
                ? [
                    {
                      text: "Удалить",
                      callback_data: `delete_${achievments[i].id}`,
                    },
                    {
                      text: "Редактировать",
                      callback_data: `edit_${achievments[i].doc}`,
                    },
                  ]
                : [],
              appState.user.isAdmin
                ? [
                    {
                      text: "Одобрить",
                      callback_data: `approve_${achievments[i].id}`,
                    },
                    {
                      text: "Отклонить",
                      callback_data: `reject_${achievments[i].id}`,
                    },
                  ]
                : [],
              i === achievments.length - 1
                ? [{ text: "В меню", callback_data: "fullBack" }]
                : [],
              appState.isSearching && i === achievments.length - 1
                ? [
                    {
                      text: "Продолжить поиск",
                      callback_data: "repeatSearch",
                    },
                  ]
                : [],
            ],
          }),
        }
      );
      // await bot
      //   .sendMessage(
      //     chatId,
      //     `Ученик: ${achievments[i].user.fullName}\nГруппа: ${
      //       achievments[i].user.group
      //     }${!achievments[i].isApproved ? "\nНА РАССМОТРЕНИИ" : ""}`,
      //     i === achievments.length - 1
      //       ? {
      //           reply_markup: JSON.stringify({
      //             inline_keyboard: [
      //               [{ text: "В меню", callback_data: "fullBack" }],
      //               appState.isSearching
      //                 ? [
      //                     {
      //                       text: "Продолжить поиск",
      //                       callback_data: "repeatSearch",
      //                     },
      //                   ]
      //                 : [],
      //             ],
      //           }),
      //         }
      //       : undefined
      //   )
      //   .catch((er) => {
      //     return;
      //   });
    }
  }
};

const auth = async (chatId) => {
  const currentUser = await Users.findOne({ where: { id: chatId } });
  if (!currentUser) {
    const newUser = await Users.create({ id: chatId });
    appState.setUser({
      id: newUser.id,
      fullName: undefined,
      semester: undefined,
      group: undefined,
      isAdmin: false,
    });
  } else {
    appState.setUser({
      id: currentUser.id,
      fullName: currentUser.fullName,
      faculty: currentUser.faculty,
      group: currentUser.group,
      isAdmin: currentUser.isAdmin,
    });
  }
};

const start = async () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    await auth(chatId);
    if (!appState.user.fullName) {
      const userData = text.split("|");
      if (userData.length === 3) {
        const fullName = userData[0].split(" ");
        const name = fullName[0]?.trim();
        const surname = fullName[1]?.trim();
        const patronymic = fullName[2]?.trim();
        if (
          fullName.length < 2 ||
          name.length < 2 ||
          surname.length < 2 ||
          (patronymic ? patronymic.length < 2 : false)
        ) {
          return await bot.sendMessage(chatId, `Некорректное ФИО!`);
        }

        const group = userData[1];

        if (group.length < 3) {
          return await bot.sendMessage(chatId, `Некорректный номер группы!`);
        }

        const faculty = userData[2];

        if (faculty.length < 10) {
          return await bot.sendMessage(chatId, `Некорректный факультет!`);
        }

        await Users.update(
          { fullName: fullName.join(" "), group, faculty },
          { where: { id: chatId } }
        );
        const updatedUser = await Users.findOne({ where: { id: chatId } });
        appState.setUser({
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          faculty: updatedUser.faculty,
          group: updatedUser.group,
          isAdmin: updatedUser.isAdmin,
        });
        return await mainMenuView(
          chatId,
          undefined,
          `Добро пожаловать, ${updatedUser.fullName}!`
        );
      }
      return await bot.sendMessage(
        chatId,
        `Добро пожаловать, ${msg.from.first_name} ${msg.from.last_name}!\nДля дальнейшего использования бота, необходимо пройти регистрацию:\nВведите данные в следующем формате:\n<ФИО>|<Группа>|<Факультет>`
      );
    }

    if (appState.isSearching) {
      const achievementsData = await Achievements.findAll({
        include: {
          model: Users,
          where: {
            [Op.or]: {
              fullName: {
                [Op.substring]: text,
              },
              group: {
                [Op.substring]: text,
              },
              faculty: {
                [Op.substring]: text,
              },
              "$achievements.achievement$": {
                [Op.substring]: text,
              },
            },
            [Op.and]: appState.user.isAdmin
              ? {}
              : {
                  "$achievements.isApproved$": true,
                },
          },
        },
      });
      return await showAchievments(chatId, achievementsData);
    }
    if (appState.isAddingNewAchievement || appState.editingAchievement) {
      if (appState.newAchievement.name) {
        return null;
      }
      const achievementData = text.split("|");
      if (achievementData.length === 2) {
        const name = achievementData[0]?.trim();
        const date = achievementData[1]?.trim();
        if (name.length < 5) {
          return await bot.sendMessage(chatId, `Слишком короткое название!`);
        }
        const dateRegex =
          /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d\d$/;
        if (!dateRegex.test(date)) {
          return await bot.sendMessage(chatId, `Некорректная дата`);
        }
        appState.setNewAchievement({
          name,
          date,
          doc: undefined,
        });
        return await bot.sendMessage(
          chatId,
          `Теперь прикрепите подтверждающий документ в формате PDF`,
          cancelMenuOptions
        );
      }
    }
    switch (text) {
      case "/start":
        return await mainMenuView(
          chatId,
          undefined,
          `Добро пожаловать, ${appState.user.fullName}!`
        );
      case "/clear":
        return await clearChat(msg);
      default:
        const message = await bot.sendMessage(
          chatId,
          text && text[0] === "/"
            ? `Неизвестная команда`
            : `Я вас не понимаю, попробуйте ещё раз!`
        );
        setTimeout(() => {
          bot.deleteMessage(msg.chat.id, msg.message_id);
          bot.deleteMessage(msg.chat.id, message.message_id);
        }, 2000);
        return message;
    }
  });
  bot.on("callback_query", async (msg) => {
    const chatId = msg.message.chat.id;
    const messageId = msg.message.message_id;
    const data = msg.data;

    if (data.includes("delete")) {
      const deleteId = data.split("_")[1];
      const deletedAchievement = await Achievements.findOne({
        where: { id: deleteId },
      });
      await Achievements.destroy({
        where: {
          id: deletedAchievement.id,
        },
      });
      await deleteFile(
        path.resolve(__dirname, "static", deletedAchievement.doc)
      );

      return await bot.sendMessage(chatId, `Успешно удалено!`);
    }
    if (data.includes("approve")) {
      const approveId = data.split("_")[1];
      const approveAchievement = await Achievements.findOne({
        where: { id: approveId },
      });
      await Achievements.update(
        { isApproved: true },
        {
          where: {
            id: approveAchievement.id,
          },
        }
      );

      return await bot.sendMessage(chatId, `Успешно одобрено!`);
    }
    if (data.includes("reject")) {
      const rejectId = data.split("_")[1];
      const rejectAchievement = await Achievements.findOne({
        where: { id: rejectId },
      });
      await Achievements.update(
        { isApproved: false },
        {
          where: {
            id: rejectAchievement.id,
          },
        }
      );

      return await bot.sendMessage(chatId, `Успешно отклонено!`);
    }
    if (data.includes("edit")) {
      const editId = data.split("_").slice(1).join("_");

      appState.editingAchievement = editId;
      return await bot.sendMessage(
        chatId,
        `Для редактирования достижения, требуется ввести данные в следующем формате:\n<Название>|<Дата получения>`,
        cancelMenuOptions
      );
    }
    switch (data) {
      case "all":
        const achievementsData = await Achievements.findAll({
          include: {
            model: Users,
          },
          where: appState.user.isAdmin
            ? undefined
            : {
                isApproved: true,
              },
        });
        return await showAchievments(chatId, achievementsData);
      case "moderate":
        const moderateAchievementsData = await Achievements.findAll({
          include: {
            model: Users,
          },
          where: {
            isApproved: null,
          },
        });
        return await showAchievments(chatId, moderateAchievementsData);
      case "search":
        appState.isSearching = true;
        return await bot.editMessageText(`Введите строку:`, {
          message_id: messageId,
          chat_id: chatId,
          ...backToMainMenuOptions,
        });
      case "repeatSearch":
        appState.isSearching = true;
        return await bot.sendMessage(
          chatId,
          `Введите строку:`,
          backToMainMenuOptions
        );
      case "back":
        return await mainMenuView(
          chatId,
          messageId,
          `Добро пожаловать, ${appState.user.fullName}!`
        );
      case "fullBack":
        return await mainMenuView(
          chatId,
          undefined,
          `Добро пожаловать, ${appState.user.fullName}!`
        );
      case "clear":
        return await clearChat(msg.message);
      case "addAchivement":
        appState.isAddingNewAchievement = true;
        return await bot.editMessageText(
          `Для добавления достижения, требуется ввести данные в следующем формате:\n<Название>|<Дата получения>`,
          {
            message_id: messageId,
            chat_id: chatId,
            ...cancelMenuOptions,
          }
        );
      case "myAchivement":
        const myAchievements = await Achievements.findAll({
          include: {
            model: Users,
          },
          where: {
            userId: chatId,
          },
        });
        return await showAchievments(chatId, myAchievements);
      default:
        return await bot.editMessageText(
          `Ошибка при исполнении команды, повторите попытку позже!`,
          {
            message_id: messageId,
            chat_id: chatId,
            ...backToMainMenuOptions,
          }
        );
    }
  });
  bot.on("document", async (msg) => {
    const chatId = msg.chat.id;
    if (
      (appState.isAddingNewAchievement || appState.editingAchievement) &&
      appState.newAchievement.name
    ) {
      const document = msg.document;
      const fileId = document.file_id;
      const mimeType = document.mime_type;

      // Проверка, что файл является PDF
      if (mimeType !== "application/pdf") {
        bot.sendMessage(chatId, "Пожалуйста, отправьте файл в формате PDF.");
        return;
      }

      try {
        // Получаем URL файла и поток файла
        const fileURL = await bot.getFileLink(document.file_id);
        const stream = await bot.getFileStream(document.file_id);

        // Устанавливаем путь для сохранения файла
        const fileName = path.basename(fileURL);
        const savePath = path.join(__dirname, "static", fileName);

        // Создаем поток записи
        const fileStream = fs.createWriteStream(savePath);

        // Пишем данные из потока в файл
        stream.pipe(fileStream);

        // Обработка завершения записи
        fileStream.on("finish", () => {
          console.log(appState.editingAchievement);
          if (appState.editingAchievement) {
            deleteFile(
              path.resolve(__dirname, "static", appState.editingAchievement)
            );
            Achievements.update(
              {
                userId: appState.user.id,
                achievement: appState.newAchievement.name,
                date: appState.newAchievement.date,
                doc: fileName,
                isApproved: null,
              },
              { where: { doc: appState.editingAchievement } }
            );
          } else {
            Achievements.create({
              userId: appState.user.id,
              achievement: appState.newAchievement.name,
              date: appState.newAchievement.date,
              doc: fileName,
            });
          }

          bot.sendMessage(
            chatId,
            "Данные успешно отправлены! После модерации они будут выведены в списках.",
            backToMainMenuOptions
          );
        });

        // Обработка ошибок
        fileStream.on("error", (error) => {
          console.error("Ошибка при сохранении файла:", error);
          bot.sendMessage(
            chatId,
            "Произошла ошибка при сохранении файла.",
            backToMainMenuOptions
          );
        });
      } catch (error) {
        console.error("Ошибка при получении документа:", error);
        bot.sendMessage(
          chatId,
          "Произошла ошибка при получении документа.",
          backToMainMenuOptions
        );
      }
    } else {
      const message = await bot.sendMessage(
        chatId,
        "Не понимаю для чего этот файл"
      );
      setTimeout(() => {
        bot.deleteMessage(msg.chat.id, msg.message_id);
        bot.deleteMessage(msg.chat.id, message.message_id);
      }, 2000);
      return message;
    }
  });
};

start();
