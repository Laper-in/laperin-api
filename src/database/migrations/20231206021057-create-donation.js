'use strict';
/** @type {import('sequelize-cli').Migration} */
const { nanoid } = require('nanoid');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('donations', {
      idDonation: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        defaultValue: nanoid(10)
      },
      idUser: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      fullname:{
        type: Sequelize.STRING
      },
      telephone:{
        type: Sequelize.BIGINT
      },
      imageUsr:{
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      total: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },
      lon: {
        type: Sequelize.FLOAT
      },
      lat: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedBy: {
        type: Sequelize.INTEGER,
      },
      deletedBy: {
        type: Sequelize.INTEGER,
        },
      deletedAt: {
        type: Sequelize.DATE,
        },
      isDone: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.BOOLEAN,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Donations');
  }
};