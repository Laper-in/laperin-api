    const express = require('express');
    const router = express.Router();
    const bookmarkControllers = require('../controllers/bookmark.controllers');
    const {
        authenticateToken,
        authenticateRefreshToken,
        checkBlacklist,
      } = require('../middlewares/auth');

    // Apply auth middleware to routes that require authentication
        router.post('/', authenticateToken,authenticateRefreshToken,checkBlacklist, bookmarkControllers.createBookmark);
        router.get('/', authenticateToken,authenticateRefreshToken,checkBlacklist, bookmarkControllers.getAllBookmarksByUserId);
        router.get('/search', authenticateToken,authenticateRefreshToken,checkBlacklist, bookmarkControllers.searchAllBookmarkByCategory);
        router.delete('/:id',authenticateToken,authenticateRefreshToken,checkBlacklist, bookmarkControllers.deleteBookmark);
        module.exports = router;
