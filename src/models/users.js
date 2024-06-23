const { DataTypes } = require("sequelize");
const db = require("../db.js");
const Achievements = require("./achievements.js");

const Users = db.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    group: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    faculty: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, // Опции
  {
    timestamps: false,
  }
);

module.exports = Users;
