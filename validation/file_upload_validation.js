const multer = require("multer");
const path = require("path");

// File upload folder
const UPLOADS_FOLDER = "./public/uploads/";


// define the storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();

    cb(null, fileName + fileExt);
  },
});

// preapre the final multer upload object
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000, // 1MB
  },
  fileFilter: (req, file, cb) => {
    console.log(req.body)
    if (file.fieldname === "pic") {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        if (file.size <= 2000000) { // Check file size here
          cb(null, true);
        } else {
          cb(new Error("File size exceeds the limit (2MB)!"));
        }
      } else {
        cb(new Error("Only .jpg, .png or .jpeg format allowed!"));
      }
    } else if (file.fieldname === "book_demo") {
      if (
        file.mimetype === "application/pdf"
      ) {
        if (file.size <= 2000000) { // Check file size here
          cb(null, true);
        } else {
          cb(new Error("File size exceeds the limit (2MB)!"));
        }
      } else {
        cb(new Error("Only .jpg, .png or .jpeg format allowed!"));
      }
    } else {
      cb(new Error("There was an unknown error!"));
    }
  },
});



  module.exports = upload.fields([
    {
      name: "pic",
      maxCount: 1,
    },
    {
      name: "book_demo",
      maxCount: 1,
    },
  ])