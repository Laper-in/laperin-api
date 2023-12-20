"use strict";
const { nanoid } = require("nanoid");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    static associate(models) {
      // define association here
    }

    static findByUser(userid) {
      return this.findAll({
        where: {
          idUser: userid,
        },
      });
    }
  }

  Bookmark.init(
    {
      idBookmark: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid(10),
      },
      idUser: DataTypes.STRING,
      idRecipe: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "bookmark",
    }
  );

  return Bookmark;
};
