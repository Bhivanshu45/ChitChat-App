const express = require('express');
const router = express.Router();

const {accessChat, fetchChats,createGroupChat, renameGroup, addToGroup ,removeFromGroup, leaveGroup} = require('../controllers/chatController.js');
const { authUser } = require('../middlewares/authMiddleware.js');
const { create } = require('../models/userSchema.js');

router.get("/", authUser,fetchChats);
router.post('/', authUser, accessChat);
router.post('/group',authUser,createGroupChat);
router.put('/rename',authUser, renameGroup);
// router.get('/group/:chatId', fetchGroupChats);
router.put('/group-remove',authUser, removeFromGroup);
router.put('/group-add',authUser, addToGroup);
router.put('/leave',authUser,leaveGroup)

module.exports = router;