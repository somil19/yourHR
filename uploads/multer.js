const multer = require("multer");
const path = require("path");

// Memory Storage
const storage = multer.memoryStorage();

// Configuration for uploading resumes
const resumeUpload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit (adjust as needed)
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb, "pdf");
  },
}).single("resume"); // Field name for resume uploads

// Configuration for uploading images
const imageUpload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit (adjust as needed)
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb, "image");
  },
}).single("profilePhoto"); // Field name for image uploads

// Check File Type
function checkFileType(file, cb, type) {
  const filetypes = type === "pdf" ? /pdf/ : /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(`Error: ${type === "pdf" ? "PDFs" : "Images"} Only!`);
  }
}

module.exports = { resumeUpload, imageUpload };
