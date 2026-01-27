import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer (Temporary Storage)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // We will save files here temporarily
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check File Type (Images Only)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 3. Upload Route
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'shopkart', // Optional: Folder name in Cloudinary
    });
    
    // Return the secure URL
    res.send({
      message: 'Image uploaded',
      image: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Cloudinary Upload Failed' });
  }
});

export default router;