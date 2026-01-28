import path from 'path';
import express from 'express';
import multer from 'multer';
import { protect, seller } from '../middleware/auth.middleware.js'; // Removed 'admin'

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
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

// Allow Sellers to upload images
router.post('/', protect, seller, upload.single('image'), (req, res) => {
  res.send(`/${req.file.path.replace(/\\/g, "/")}`); // Fix for Windows paths
});

export default router;