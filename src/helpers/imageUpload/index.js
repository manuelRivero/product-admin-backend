const cloudinary = require('cloudinary').v2;

// Configuration 
cloudinary.config({
    cloud_name: "djbolgjce",
    api_key: "738972582381482",
    api_secret: "-IzWUzf_CFnCWHvmF1tRF1aYIEw"
  });

  
module.exports = {
  cloudinary
}