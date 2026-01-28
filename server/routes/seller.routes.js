import express from 'express';
import { protect, seller } from '../middleware/auth.middleware.js';
import { getSellerStats, registerSeller,getSellerProfile } from '../controllers/seller.controller.js';

const router = express.Router();

router.get('/dashboard', protect, seller, getSellerStats);
router.post('/register', protect, registerSeller);
router.get('/profile/:id', getSellerProfile);

export default router;