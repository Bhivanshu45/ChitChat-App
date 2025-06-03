const express = require('express');
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { registerUser, loginUser, searchUser } = require('../controllers/userController.js');
const { authUser } = require('../middlewares/authMiddleware.js');

router.post("/signup", upload.single("profilePicture"), registerUser);
router.post('/login',loginUser);
router.get('/profile', authUser, searchUser);

module.exports = router;