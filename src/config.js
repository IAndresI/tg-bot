const dotenv = require("dotenv");
dotenv.config();

const TelegramApi = require("node-telegram-bot-api");
const db = require("./db.js");

db.authenticate().catch((error) => console.error(error));

const TOKEN = process.env.TOKEN;

const bot = new TelegramApi(TOKEN, { polling: true });

bot.setMyCommands([
  { command: "/start", description: "Привествие / ресет" },
  { command: "/clear", description: "Очистить чат" },
]);

module.exports = bot;
