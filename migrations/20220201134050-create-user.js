'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50)
      },
      email: {
        type: Sequelize.STRING(100)
      },
      fullname: {
        type: Sequelize.STRING(100)
      },
      password: {
        type: Sequelize.STRING(255)
      },
      picture: {
        type: Sequelize.STRING(100)
      },
      alamat: {
        type: Sequelize.STRING(255)
      },
      telephone: {
        type: Sequelize.INTEGER(20)
      },
      role: {
        type: Sequelize.STRING(10),
        defaultValue: 'user'
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
        type: Sequelize.INTEGER
      },
      deletedBy: {
        type: Sequelize.INTEGER
      },
      deletedAt: {
        type: Sequelize.DATE
      },
      isDeleted: {
        type: Sequelize.BOOLEAN
      },
      isPro: {
        type: Sequelize.BOOLEAN
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};