const Chat = require("../models/chatSchema.js")
const User = require("../models/userSchema.js");

//create user chats
exports.accessChat = async (req, res) => {
    try{
        const { userId } = req.body;

        // console.log("Accessing chat with userId:", userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        let chat = await Chat.findOne({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user.id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
        .populate("users", "-password")
        .populate("latestMessage");

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email profilePicture",
        });

        if (chat) {
            return res.status(200).json({
                success: true,
                chat,
            });
        }

        const person = await User.findById(userId);

        if(!person){
            return res.status(400).json({
              success: false,
              message: "User not Exist",
            });
        }
        

        chat = await Chat.create({
            chatName: person.name,
            isGroupChat: false,
            users: [req.user.id, userId],
        });

        console.log("New chat created:", chat);

        chat = await Chat.findById(chat._id)
            .populate("users", "-password")
            .populate("latestMessage");

        return res.status(200).json({
            success: true,
            chat,
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to access chat",
            error: err.message,
        });
    }
}

// fetch all chats of a user
exports.fetchChats = async (req, res) => {
    try{
        // find inside chats that this user is present
        const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        if(!chats){
            return res.status(404).json({
                success: false,
                message: "No chats found",
            });
        }

        return res.status(200).json({
            success: true,
            chats,
        });
        
    }catch(err){
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch the chats",
          error: err.message,
        });

    }
}

exports.createGroupChat = async (req, res) => {
    try{
        const { users, chatName } = req.body;

        if (!users || !chatName) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // convert users to array of objectIds
        if (users.length < 2) {
            return res.status(400).json({
                success: false,
                message: "A group chat must have at least 2 users",
            });
        }

        users.push(req.user.id);

        const groupChat = await Chat.create({
            chatName: chatName,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user.id,
        });

        if(!groupChat){
            return res.status(500).json({
                success: false,
                message: "Failed to create group chat",
            });
        }

        const fullGroupChat = await Chat.findById(groupChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        return res.status(200).json({
            success: true,
            groupChat: fullGroupChat,
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to create group chat",
            error: err.message,
        });
    }
}

exports.renameGroup = async (req, res) => {
    try{
        const { chatId, chatName } = req.body;

        if (!chatId || !chatName) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName: chatName },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if(!updatedChat){
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        return res.status(200).json({
            success: true,
            groupChat: updatedChat,
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to rename group",
            error: err.message,
        });
    }
}

exports.addToGroup = async (req,res) => {
    try{
        const { chatId, userId } = req.body;

        if (!chatId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Check if the user is already in the group
        if (chat.users.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is already in the group",
            });
        }

        // Add user to the group
        chat.users.push(userId);
        const updatedChat = await chat.save();

        const fullUpdatedChat = await Chat.findById(updatedChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        return res.status(200).json({
            success: true,
            groupChat: fullUpdatedChat,
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to add user to group",
            error: err.message,
        });
    }
}

exports.removeFromGroup = async (req, res) => {
    try{
        const { chatId, userId } = req.body;

        // console.log("Chat ID : ",chatId)
        // console.log("userId : ",userId)

        if (!chatId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Check if the user is in the group
        if (!chat.users.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User is not in the group",
            });
        }

        // Remove user from the group
        chat.users = chat.users.filter(user => user.toString() !== userId);
        const updatedChat = await chat.save();

        const fullUpdatedChat = await Chat.findById(updatedChat._id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        // console.log("fullUpdatedChat : ",fullUpdatedChat)

        return res.status(200).json({
            success: true,
            groupChat: fullUpdatedChat,
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to remove user from group",
            error: err.message,
        });
    }
}

exports.leaveGroup = async(req,res) => {
    try {
      const { chatId, userId } = req.body;

      // console.log("Chat ID : ",chatId)
      // console.log("userId : ",userId)

      if (!chatId || !userId) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      const chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      // Check if the user is in the group
      if (!chat.users.includes(userId)) {
        return res.status(400).json({
          success: false,
          message: "User is not in the group",
        });
      }

      const isAdminLeaving = chat.groupAdmin.toString() === userId;

      // Remove user from group
      chat.users = chat.users.filter((id) => id.toString() !== userId);

      // If the user is the admin and there are still users left, promote the first joined user
      if (isAdminLeaving && chat.users.length > 0) {
        chat.groupAdmin = chat.users[0]; // Promote the first remaining user
      }

      // Optional: If no users are left, unset the groupAdmin
      if (chat.users.length === 0) {
        chat.groupAdmin = undefined;
      }
      
      const updatedChat = await chat.save();

      const fullUpdatedChat = await Chat.findById(updatedChat._id)
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      // console.log("fullUpdatedChat : ",fullUpdatedChat)

      return res.status(200).json({
        success: true,
        groupChat: fullUpdatedChat,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to leave from group",
        error: err.message,
      });
    }
}