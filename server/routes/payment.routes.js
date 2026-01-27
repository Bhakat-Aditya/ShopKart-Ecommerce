import express from 'express';
import { createRazorpayOrder, getRazorpayKey } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/create-order').post(protect, createRazorpayOrder);
router.get('/get-key', getRazorpayKey); 
export default router;