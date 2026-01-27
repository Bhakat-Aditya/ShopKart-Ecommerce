import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getMyProducts // <--- Import
} from '../controllers/product.controller.js';
import { protect, seller } from '../middleware/auth.middleware.js'; // Use 'seller', remove 'admin'

const router = express.Router();

// Public Routes
router.route('/').get(getProducts).post(protect, seller, createProduct);
router.route('/:id/reviews').post(protect, createProductReview);

// Seller Routes
router.route('/myproducts').get(protect, seller, getMyProducts); // <--- New Route

// Product Operations (Protected by 'seller' middleware)
router.route('/:id')
    .get(getProductById)
    .put(protect, seller, updateProduct)
    .delete(protect, seller, deleteProduct);

export default router;