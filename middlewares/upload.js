const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "driving_school",  // folder name
      resource_type: "auto",     // allow images, pdf, videos, etc.
      public_id: Date.now(),     // unique name
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
