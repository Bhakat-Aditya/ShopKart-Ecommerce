import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid, 
    updateOrderToDelivered,
    getMyOrders,
    getSellerOrders,
    deleteOrder
} from '../controllers/order.controller.js';

// Removed 'admin' from here because we deleted the admin middleware
import { protect, seller } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems);

router.route('/myorders').get(protect, getMyOrders);

router.route('/seller').get(protect, seller, getSellerOrders);

router.route('/:id')
    .get(protect, getOrderById)
    .delete(protect, deleteOrder);
    
router.route('/:id/pay').put(protect, updateOrderToPaid);

router.route('/:id/deliver').put(protect, seller, updateOrderToDelivered);

export default router;