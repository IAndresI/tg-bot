const { DataTypes } = require("sequelize");
const db = require("../db.js");
const Users = require("./users.js");

const Achievements = db.define(
  "achievements",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },
    achievement: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doc: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, // Опции
  {
    timestamps: false,
  }
);

module.exports = Achievements;
