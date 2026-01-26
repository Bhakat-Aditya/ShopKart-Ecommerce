import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct
} from '../controllers/product.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route: GET /api/products (Public) -> Fetch all products
// Route: POST /api/products (Admin) -> Create a product
router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

// Route: GET /api/products/:id (Public) -> Fetch single product
router.route('/:id').get(getProductById);

export default router;