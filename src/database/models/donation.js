// models/donation.js

const { Model } = require("sequelize");
const { nanoid } = require("nanoid");

module.exports = (sequelize, DataTypes) => {
  class Donation extends Model {
    static associate(models) {
      // define association here
    }
  }

  Donation.init(
    {
      idDonation: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid(10), // 10 karakter id
      },
      idUser: DataTypes.STRING,
      username: DataTypes.STRING(50),
      fullname: DataTypes.STRING,
      telephone: DataTypes.BIGINT(12),
      imageUsr: DataTypes.STRING,
      name: DataTypes.STRING(50),
      description: DataTypes.STRING(50),
      category: DataTypes.STRING(50),
      total: DataTypes.INTEGER, // Use INTEGER for total instead of INTEGER(255)
      image: DataTypes.STRING(255),
      lon: DataTypes.FLOAT,
      lat: DataTypes.FLOAT,
      deletedBy: DataTypes.INTEGER,
      deletedAt: DataTypes.DATE,
      isDone: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "donation",
    }
  );

  return Donation;
};
