  'use strict';
  const { Model } = require('sequelize');
  const { nanoid } = require('nanoid');

  module.exports = (sequelize, DataTypes) => {
    class Recipe extends Model {
      static associate(models) {
      }
    }

    Recipe.init({
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid(10) // 10 karakter id
      },
      name: DataTypes.STRING(50) ,
      ingredient: DataTypes.STRING(1200),
      description: DataTypes.STRING(1200),
      category: DataTypes.STRING(20),
      guide: DataTypes.STRING(1200),
      time: DataTypes.TIME,
      video: DataTypes.STRING(255),
      image: DataTypes.STRING(50), 
      createdAt: DataTypes.DATE,
      createBy: DataTypes.STRING(50),
      updatedAt: DataTypes.DATE,
      updatedBy: DataTypes.STRING(50),
    }, {
      sequelize,
      modelName: 'recipe',
    });

    return Recipe;
  };
