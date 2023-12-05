'use strict';
const { nanoid } = require('nanoid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        defaultValue: nanoid(10)
      },
      name: {
        type: Sequelize.STRING
      },
      ingredient: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      guide: {
        type: Sequelize.STRING
      },
      urlVideo: {
        type: Sequelize.STRING
      },
      image: { 
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recipes');
  }
};
