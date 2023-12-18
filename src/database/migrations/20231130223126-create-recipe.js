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
          type: Sequelize.STRING,
          defaultValue: 'makanan',
        },
        description: {
          type: Sequelize.STRING,
          defaultValue: 'deskripsi',
        },
        ingredient: {
          type: Sequelize.STRING,
          defaultValue: 'bahan',
        },
        category: {
          type: Sequelize.STRING,
          defaultValue: 'makanan',
        },
        guide: {
          type: Sequelize.STRING,
          defaultValue: 'cara masak',
        },
        time: {
          type: Sequelize.TIME,
          defaultValue: '00:00:00',
        },
        video: {
          type: Sequelize.STRING,
          defaultValue: 'https://storage.googleapis.com/devopments123/public/recipes/media/videos/Resep%20ayam%20woku%20pedesnya%20mantap!!.mp4',
        },
        image: { 
          type: Sequelize.STRING,
          defaultValue: 'https://storage.googleapis.com/devopments123/public/recipes/media/images/image%2017.png',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: new Date(),
        },
        createBy: {
          type: Sequelize.STRING,
          defaultValue: 'admin',
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedBy: {
          type: Sequelize.STRING,
          defaultValue: 'admin',
        },
      });
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Recipes');
    }
  };
