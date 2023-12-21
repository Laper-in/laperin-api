"use strict";
const { Model } = require("sequelize");
const { nanoid } = require("nanoid");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }

    // Define a static method to fetch a user by ID
    static async getUserById(userId) {
      try {
        const user = await this.findByPk(userId);
        return user;
      } catch (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        defaultValue: () => nanoid(10),
      },
      username: DataTypes.STRING(50),
      email: DataTypes.STRING(100),
      fullname: DataTypes.STRING(100),
      password: DataTypes.STRING(255),
      image: DataTypes.STRING(100),
      alamat: DataTypes.STRING(255),
      telephone: DataTypes.BIGINT(20),
      role: DataTypes.STRING(10),
      updatedBy: DataTypes.STRING,
      deletedBy: DataTypes.INTEGER,
      deletedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
      isPro: DataTypes.BOOLEAN,
      isChef: DataTypes.BOOLEAN,
      isOnline: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "user",
    }
  );

  return User;
};
