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


router.route('/')
    .post(registerUser)
    .get(protect, admin, getUsers); // GET /api/users (Admin Only)

router.route('/:id')
    .delete(protect, admin, deleteUser); // DELETE /api/users/:id (Admin Only)

router.route('/:id')
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

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




router.route('/wishlist')
    .get(protect, getWishlist);

router.route('/wishlist/:id')
    .put(protect, toggleWishlist);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;