'use strict';
const { Model } = require('sequelize');
const { nanoid } = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
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
      picture: DataTypes.STRING(100),
      alamat: DataTypes.STRING(255),
      telephone: DataTypes.INTEGER(20),
      role: DataTypes.STRING(10),
      updatedBy: DataTypes.INTEGER,
      deletedBy: DataTypes.INTEGER,
      deletedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
      isPro: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};
