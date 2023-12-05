'use strict';
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('kamusiapa?!', 10);
    const userId = nanoid(10); // Generate a unique ID using nanoid

    await queryInterface.bulkInsert('Users', [
      {
        id: userId,
        username: 'Adminsrotor',
        email: 'admin@gmail.com',
        fullname: 'admin',
        password: hashedPassword,
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

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
