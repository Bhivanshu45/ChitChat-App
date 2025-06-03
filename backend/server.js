const express = require('express');
require('dotenv').config();
const connectDB = require('./config/database.js');
const {notFound,errorHandler} = require('./middlewares/errorMiddleware.js')

connectDB();

// cloudinary connection
const cloudinaryConnect = require('./config/cloudinary.js');
cloudinaryConnect();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());

/*app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is up and running",
  });
});*/

const userRoute = require("./routes/userRoutes.js");
const chatRoute = require("./routes/chatRoutes.js");

app.use('/api/v1/user',userRoute);
app.use('/api/v1/chat', chatRoute);

app.use(notFound);
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});