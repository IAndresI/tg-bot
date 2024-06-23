module.exports = {
  mainMenuOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Список всех достижений", callback_data: "all" }],
        [{ text: "Поиск", callback_data: "search" }],
        [{ text: "Мои достижения", callback_data: "myAchivement" }],
        [{ text: "Добавить достижение", callback_data: "addAchivement" }],
        [{ text: "Очистить чат", callback_data: "clear" }],
      ],
    }),
  },

  adminMainMenuOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Список всех достижений", callback_data: "all" }],
        [{ text: "Поиск", callback_data: "search" }],
        [{ text: "Добавить достижение", callback_data: "addAchivement" }],
        [{ text: "Мои достижения", callback_data: "myAchivement" }],
        [{ text: "Модерировать новые достижения", callback_data: "moderate" }],
        [{ text: "Очистить чат", callback_data: "clear" }],
      ],
    }),
  },

  backToMainMenuOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Назад", callback_data: "back" }]],
    }),
  },

  cancelMenuOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [[{ text: "Отменить", callback_data: "back" }]],
    }),
  },
};
