  'use strict';
  const { nanoid } = require('nanoid');

  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.createTable('users', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING(10),
          defaultValue: () => nanoid(10),
        },
        username: {
          type: Sequelize.STRING(50),
        },
        email: {
          type: Sequelize.STRING(100),
        },
        fullname: {
          type: Sequelize.STRING(100),
        },
        password: {
          type: Sequelize.STRING(255),
        },
        picture: {
          type: Sequelize.STRING(100),
        },
        alamat: {
          type: Sequelize.STRING(255),
        },
        telephone: {
          type: Sequelize.BIGINT(20),
        },
        role: {
          type: Sequelize.STRING(10),
          defaultValue: 'user',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
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
        isDeleted: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.BOOLEAN,
        },
        isPro: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.BOOLEAN,
        },
      });
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Users');
    }
  };
