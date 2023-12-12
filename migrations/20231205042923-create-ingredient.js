  'use strict';
  const { nanoid } = require('nanoid');
  /** @type {import('sequelize-cli').Migration} */
  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.createTable('ingredients', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING,
          defaultValue: nanoid(10)
        },
        name: {
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
      await queryInterface.dropTable('Ingredients');
    }
  };