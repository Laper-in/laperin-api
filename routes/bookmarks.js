    const express = require('express');
    const router = express.Router();
    const bookmarkControllers = require('../controllers/bookmark.controllers');
    const authMiddleware = require('../middlewares/auth');

    // Apply auth middleware to routes that require authentication
        router.post('/', authMiddleware.auth('user'), bookmarkControllers.createBookmark);
        router.get('/:id', authMiddleware.auth('user'), bookmarkControllers.readAllBookmarksByUserId);
        router.delete('/:id',authMiddleware.auth('user'), bookmarkControllers.deleteBookmark);
        module.exports = router;
