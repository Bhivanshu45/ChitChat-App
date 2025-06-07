const generateToken = require('../config/generateToken.js');
const User = require('../models/userSchema.js');
const bcrypt = require("bcrypt");
const uploadImageToCloud = require("../utils/imageUploader.js");
require("dotenv").config();

exports.registerUser = async(req,res) => {
    try{
      const {
        name,
        email,
        password,
        isAdmin = false,
      } = req.body;

      

      // console.log(`name- ${name}, email- ${email}, password- ${password}, isAdmin- ${isAdmin}`);
      const file = req?.file;
      // console.log("file.path:", file.path);

      if (!name && !email && !password) {
        return res.status(400).json({
          success: false,
          message: "Fill the required details",
        });
      }

      // check user already registed or not
      const userExist = await User.findOne({ email });

      if (userExist) {
        return res.status(400).json({
          success: false,
          message: "User aleready exists",
        });
      }

      // hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // upload thumbnail to cloudinary
      let profilePicture =
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
      if(file?.path){
        const uploadFile = await uploadImageToCloud(
          file?.path,
          process.env.FOLDER_NAME,
          80
        );
        profilePicture = uploadFile.secure_url
      }

      // console.log("profilePicture:", profilePicture);

      // create user
      let user = await User.create({
        name,
        email,
        password: hashedPassword,
        profilePicture: profilePicture,
        isAdmin,
      });

      // console.log("user:", user);

      // remove password before sending details
      user = user.toObject();
      user.password = undefined;

      const payload = {
        email: user.email,
        id: user._id,
        isAdmin: user.isAdmin,
      };

      // generate Token
      const token = generateToken(payload);

      // return response
      return res.status(200).json({
        success: true,
        message: "User Registered Successfully",
        user,
        token: token,
      });
    }catch(err){
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "user SignUp failed",
          error: err.message,
        });
    }
}

// login user
exports.loginUser = async(req,res) => {
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
              success: false,
              message: "Fill the required details",
            });
        }

        let user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({
              success: false,
              message: "User not Exists",
            });
        }

        // compare password
        const comparePassword = await bcrypt.compare(password,user.password);
        if(!comparePassword){
            return res.status(400).json({
                success:false,
                message:"Password Mismatch"
            })
        }

        // remove password
        user = user.toObject();
        user.password = undefined;

        // make payload and add to token
        const payload = {
          email: user.email,
          id: user._id,
          isAdmin: user.isAdmin,
        };

        const token = await generateToken(payload);

        // send status
        return res.status(200).json({
            success:true,
            message: "User Login successful",
            user,
            token
        })



    }catch(err){
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "user Login failed",
          error: err.message,
        });
    }
}

exports.searchUser = async(req,res) => {
    try{
      const search = req.query.search;

      // console.log("Search query:", search);
      
      if (!search) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const users = await User.find({
        $and: [{
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
        { _id: { $ne: req.user.id } }]}).select("-password");

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users,
      });


        
    }catch(err){
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "User fetching failed",
          error: err.message,
        });
    }
}


