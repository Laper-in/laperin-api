const { Storage } = require("@google-cloud/storage");
const { upload } = require("./multerMiddleware");
require("dotenv").config();

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT,
  keyFilename: process.env.GCS_KEYFILE,
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

const allowedTypes = ["jpg", "jpeg", "png"];
const maxSize = 2 * 1024 * 1024;

const uploadToBucket = (file, cb, destinationFolder) => {
  if (!file) {
    const error = new Error("No file provided");
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }
  const ext = file.originalname.split(".").pop().toLowerCase();
  if (!allowedTypes.includes(ext)) {
    const error = new Error("Only JPG, JPEG, and PNG files are allowed");
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }
  if (file.size > maxSize) {
    const error = new Error("File size exceeds the limit (2MB)");
    error.code = "LIMIT_FILE_SIZE";
    return cb(error, false);
  }
  const folderPath = `public/${destinationFolder}/images`; 
  const fileName = `${Date.now()}-${file.fieldname}.${ext}`; 
  const bucketFile = bucket.file(`${folderPath}/${fileName}`); 
  const stream = bucketFile.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  stream.on("error", (err) => {
    console.error("Stream Error:", err);
    cb(err, null);
  });

  stream.on("finish", () => {
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${bucketFile.name}`;
    const fileInfo = {
      originalFilename: file.originalname,
      imageUrl: imageUrl,
    };
    cb(null, fileInfo);
  });

  stream.end(file.buffer);
};

const uploadVideoToBucket = (file, cb, destinationFolder) => {
  const allowedTypes = ["mp4", "avi", "mkv"];

  if (!file) {
    const error = new Error("No file provided");
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }

  const ext = file.originalname.split(".").pop().toLowerCase();

  if (!allowedTypes.includes(ext)) {
    const error = new Error("Only MP4, AVI, and MKV files are allowed");
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }

  const maxSize = 100 * 1024 * 1024; 

  if (file.size > maxSize) {
    const error = new Error("File size exceeds the limit (50MB)");
    error.code = "LIMIT_FILE_SIZE";
    return cb(error, false);
  }

  const folderPath = `public/${destinationFolder}/videos`;
  const fileName = `${Date.now()}-${file.fieldname}.${ext}`;
  const bucketFile = bucket.file(`${folderPath}/${fileName}`);
  const stream = bucketFile.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  stream.on("error", (err) => {
    console.error("Stream Error:", err);
    cb(err, null);
  });

  stream.on("finish", () => {
    const videoUrl = `https://storage.googleapis.com/${bucket.name}/${bucketFile.name}`;
    const fileInfo = {
      originalFilename: file.originalname,
      videoUrl: videoUrl,
    };
    cb(null, fileInfo);
  });

  stream.end(file.buffer);
};

module.exports = { uploadToBucket, bucket, uploadVideoToBucket };
