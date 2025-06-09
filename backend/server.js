const express = require('express');
require('dotenv').config();
const http = require('http')
const connectDB = require('./config/database.js');
const {notFound,errorHandler} = require('./middlewares/errorMiddleware.js')
const {Server} = require('socket.io')

connectDB();

// cloudinary connection
const cloudinaryConnect = require('./config/cloudinary.js');
cloudinaryConnect();

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app)
const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

app.use(express.json());

/*app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});*/

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined Room : ", room);
  });

  socket.on("typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("typeIndication", userId);
  });

  socket.on("stop typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("stop indication", userId);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return; // optional, but you can include sender if needed
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
  

  socket.off('setup',() => {
    console.log("USER DISCONNECTED")
    socket.leave(userData._id)
  })

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const userRoute = require("./routes/userRoutes.js");
const chatRoute = require("./routes/chatRoutes.js");
const messageRoute = require("./routes/messageRoutes.js")

app.use('/api/v1/user',userRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/message',messageRoute)

app.use(notFound);
app.use(errorHandler);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});