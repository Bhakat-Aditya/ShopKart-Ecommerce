import path from 'path';
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; 
import dotenv from 'dotenv'; // <--- 1. Import dotenv

dotenv.config(); // <--- 2. Load env vars IMMEDIATELY

const router = express.Router();

// 3. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 4. Configure Multer (Temporary Storage)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

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

// 5. Upload Route
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'shopkart',
    });
    
    // --- CRITICAL FIX: Delete local file after upload ---
    try {
        fs.unlinkSync(req.file.path); 
    } catch (fsError) {
        console.error("Failed to delete local file:", fsError);
    }
    // ---------------------------------------------------

    res.send({
      message: 'Image uploaded',
      image: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary Error:", error); 
    
    // If it fails, delete the local file anyway
    if (req.file && fs.existsSync(req.file.path)) {
        try {
            fs.unlinkSync(req.file.path);
        } catch (ignored) {}
    }

    res.status(500).send({ message: 'Cloudinary Upload Failed' });
  }
});

export default router;