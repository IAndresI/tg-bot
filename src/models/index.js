const Achievements = require("./achievements.js");
const Users = require("./users.js");

Users.hasMany(Achievements, { as: "achievements" });
Achievements.belongsTo(Users);

module.exports = {
  Achievements,
  Users,
};
