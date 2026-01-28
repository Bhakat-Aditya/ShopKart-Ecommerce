import express from 'express';
import {
    registerUser,
    loginUser,
    verifyOtpAndLogin,
    addAddress,
    getAddresses,
    updateUserProfile 
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtpAndLogin);

// --- NEW ROUTE ---
router.put('/profile', protect, updateUserProfile);
// -----------------

router.route('/address')
    .post(protect, addAddress)
    .get(protect, getAddresses);

router.put('/profile', protect, updateUserProfile);

export default router;