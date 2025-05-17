const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { loginUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');




router.post('/register', userController.registerUser);


router.post('/login', loginUser);
router.get('/profile', authMiddleware, userController.getProfile);
router.post('/logout', authMiddleware, userController.logoutUser);
module.exports = router;
