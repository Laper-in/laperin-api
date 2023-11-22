'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('Users', [
       {
          username: 'superuser',
          email: 'superuser@gmail.com',
          fullname: 'superuser',
          password: 'qwerty',
          picture: 'default.png',
          bio: 'superuser bio here',
          createdBy: 0,
          createdAt: new Date(),
          updatedBy: 0,
          updatedAt: new Date(),
          isDeleted: false
      },
      {
        username: 'admin',
        email: 'admin@gmail.com',
        fullname: 'admin',
        password: 'qwerty',
        picture: 'default.png',
        bio: 'admin bio here',
        createdBy: 0,
        createdAt: new Date(),
        updatedBy: 0,
        updatedAt: new Date(),
        isDeleted: false
      },   
      {
        username: 'tester',
        email: 'tester@gmail.com',
        fullname: 'tester',
        password: 'qwerty',
        picture: 'default.png',
        bio: 'tester bio here',
        createdBy: 0,
        createdAt: new Date(),
        updatedBy: 0,
        updatedAt: new Date(),
        isDeleted: false
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