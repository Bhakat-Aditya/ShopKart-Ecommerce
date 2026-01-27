import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    deleteProduct,
    updateProduct
} from '../controllers/product.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route('/:id')
    .get(getProductById)
    .delete(protect, admin, deleteProduct)
    .put(protect, admin, updateProduct);

export default router;