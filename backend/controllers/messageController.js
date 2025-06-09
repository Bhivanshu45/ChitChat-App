const { response } = require("express");
const Chat = require("../models/chatSchema");
const Message = require("../models/messageSchema");
const User = require("../models/userSchema");

exports.sendMessage = async(req,res) => {
    try{
        const {content,chatId} = req.body;

        if(!content || !chatId){
            return res.status(400).json({
                success: false,
                message: "Invalid Data request",
            })
        }


        let newMessage = await Message.create({
            sender: req.user.id,
            content: content,
            chat: chatId
        })

        if(!newMessage){
            return res.status(400).json({
                success: false,
                message: "message sending failed"
            })
        }

        newMessage = await newMessage.populate('sender','name profilePicture')
        newMessage = await newMessage.populate('chat')
        newMessage = await User.populate(newMessage,{
            path: "chat.users",
            select: 'name profilePicture email'
        })

        // update chat data
        await Chat.findByIdAndUpdate(chatId,{
            latestMessage : newMessage
        })

        // return response
        return res.status(200).json({
            success: true,
            message: "Message sent Successfully",
            newMessage: newMessage
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "User fetching failed",
          error: err.message,
        });
    }
}

exports.getChatMessages = async(req,res) => {
    try{
        const chatId = req.params.chatId;
        if(!chatId){
            return res.status(400).json({
                success:false,
                message:"Bad parameter request"
            })
        }

       const messages = await Message.find({chat: chatId }).populate("sender","name email profilePicture").populate("chat");

       if(!messages){
        return res.status(400).json({
            success:false,
            message:"Messages fetching failed"
        })
       }

       return res.status(200).json({
        success:true,
        message: "Messages fetched successfully",
        messages
       })

    }catch(err){
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "User fetching failed",
          error: err.message,
        });
    }
}