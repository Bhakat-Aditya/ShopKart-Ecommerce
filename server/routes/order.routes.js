import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid, // Now this exists in the controller!
    getMyOrders,
    getSellerOrders
} from '../controllers/order.controller.js';

// Removed 'admin' from here because we deleted the admin middleware
import { protect, seller } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/seller').get(protect, seller, getSellerOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

export default router;