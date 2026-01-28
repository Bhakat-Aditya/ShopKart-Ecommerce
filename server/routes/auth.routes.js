import express from 'express';
import {
    registerUser,
    loginUser,
    verifyOtpAndLogin,
    addAddress,
    getAddresses,
    updateUserProfile,
    toggleWishlist,
    getWishlist,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    getUserById,
    updateUser
} from '../controllers/auth.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- 1. PUBLIC ROUTES (Specific) ---
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtpAndLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// --- 2. PROTECTED USER ROUTES (Specific) ---
// These MUST come before /:id to avoid being treated as an ID
router.put('/profile', protect, updateUserProfile);

router.route('/address')
    .post(protect, addAddress)
    .get(protect, getAddresses);

router.route('/wishlist')
    .get(protect, getWishlist);

router.route('/wishlist/:id')
    .put(protect, toggleWishlist);

// --- 3. ADMIN ROUTES (Dynamic /:id) ---
// This grabs "anything else" as an ID, so it must be LAST
router.route('/')
    .get(protect, admin, getUsers); // Moved getUsers here (GET /api/users)

router.route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

export default router;