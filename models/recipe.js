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
    name: DataTypes.STRING,
    ingredient: DataTypes.STRING,
    category: DataTypes.STRING,
    image: DataTypes.STRING 
  }, {
    sequelize,
    modelName: 'Recipe',
  });

  return Recipe;
};
