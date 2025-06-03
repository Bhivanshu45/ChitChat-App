const cloudinary = require("cloudinary").v2;

const uploadImageToCloud = async (file, folder, quality = 100) => {
  const options = { folder, resource_type: "auto", quality };
  // if(height){
  //     options.height = height;
  // }
  return await cloudinary.uploader.upload(file, options);

};

module.exports = uploadImageToCloud;
