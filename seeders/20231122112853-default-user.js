'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('Users', [
       {
          username: 'admin',
          email: 'admin@gmail.com',
          fullname: 'admin',
          password: 'admin',
          picture: 'admin.png',
          alamat: 'superuser bio here',
          telephone: 123456789,
          role: 'admin',
          createdAt: new Date(),
          updatedBy: 0,
          updatedAt: new Date(),
          isDeleted: false,
          isPro: false
      }       
    ]);

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};