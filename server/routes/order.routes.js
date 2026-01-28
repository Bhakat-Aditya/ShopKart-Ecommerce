import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    updateOrderStatus, // <--- IMPORT THIS
    getMyOrders,
    getSellerOrders,
    deleteOrder,
    getAdminStats
} from '../controllers/order.controller.js';
import { protect, seller, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/admin/stats').get(protect, admin, getAdminStats);

router.route('/').post(protect, addOrderItems);

router.route('/myorders').get(protect, getMyOrders);

router.route('/seller').get(protect, seller, getSellerOrders);

// --- NEW STATUS ROUTE ---
router.route('/:id/status').put(protect, seller, updateOrderStatus);
// -----------------------

router.route('/:id')
    .get(protect, getOrderById)
    .delete(protect, deleteOrder);

router.route('/:id/pay').put(protect, updateOrderToPaid);

router.route('/:id/deliver').put(protect, seller, updateOrderToDelivered);

export default router;