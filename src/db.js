const Sequilize = require("sequelize");

module.exports = new Sequilize("student_achievements", "postgres", "7098", {
  host: "localhost",
  dialect: "postgres",
  operatorsAliases: 0,
  pool: {
    max: 5,
    min: 0,
    acquire: 3000,
    idle: 10000,
  },
});
