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
      category: DataTypes.STRING(20),
      guide: DataTypes.STRING(1200),
      urlVideo: DataTypes.STRING(255),
      image: DataTypes.STRING(50) 
    }, {
      sequelize,
      modelName: 'Recipe',
    });

    return Recipe;
  };
