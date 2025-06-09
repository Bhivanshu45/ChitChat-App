const express = require('express');
const router = express.Router();

const { authUser } = require('../middlewares/authMiddleware');
const { sendMessage, getChatMessages } = require('../controllers/messageController');

router.post('/',authUser,sendMessage);
router.get('/:chatId',authUser,getChatMessages);

module.exports = router;