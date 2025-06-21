const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { loginUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { punchIn, punchOut } = require("../controllers/punchController");
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, // 5 attempts per 15 min on login only
    message: {
      status: 429,
      message: "Too many login attempts, please try again after 15 minutes."
    }
  });

router.post("/register", userController.registerUser);
// router.post("/login", loginUser);
router.post("/login",loginLimiter, loginUser);
router.get("/profile", authMiddleware, userController.getProfile);
router.post("/logout", authMiddleware, userController.logoutUser);
router.post("/punch-in", authMiddleware, punchIn);
router.post("/punch-out", authMiddleware, punchOut);


module.exports = router;
 