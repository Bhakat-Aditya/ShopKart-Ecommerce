import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

export const getSellerStats = async (req, res) => {
    try {
        const sellerId = req.user._id;

        // 1. Get all products by this seller
        const products = await Product.find({ user: sellerId });

        // 2. Calculate Inventory Stats
        let totalStock = 0;
        let futureProfit = 0; // If all stock sells

        products.forEach(product => {
            totalStock += product.countInStock;
            futureProfit += (product.price * product.countInStock);
        });

        const orders = await Order.find({ "orderItems.product": { $in: products.map(p => p._id) } });

        let totalEarnings = 0;
        let totalSoldItems = 0;

        orders.forEach(order => {
            if (order.isPaid) {
                order.orderItems.forEach(item => {
                    // Only count if this item belongs to the seller
                    if (products.some(p => p._id.toString() === item.product.toString())) {
                        totalEarnings += (item.qty * item.price);
                        totalSoldItems += item.qty;
                    }
                });
            }
        });

        res.json({
            productsCount: products.length,
            totalStock,
            futureProfit,
            totalEarnings,
            totalSoldItems
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const registerSeller = async (req, res) => {
    try {
        const { name, description, logo } = req.body;

        const user = await User.findById(req.user._id);

        if (user) {
            user.isSeller = true;
            user.seller = {
                name,
                logo: logo || "",
                description,
                rating: 0,
                numReviews: 0
            };

            const updatedUser = await user.save();

            // Return updated user info with token (to refresh frontend context)
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                isSeller: updatedUser.isSeller,
                token: req.headers.authorization.split(' ')[1] // Keep existing token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSellerProfile = async (req, res) => {
    try {
        // 1. Get Seller Info (Exclude sensitive data like password/email)
        const user = await User.findById(req.params.id).select('name seller createdAt');

        if (!user || !user.isSeller) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        // 2. Get Seller's Active Products
        const products = await Product.find({ user: req.params.id, isPublished: true });

        res.json({
            seller: {
                id: user._id,
                name: user.seller.name || user.name,
                logo: user.seller.logo,
                description: user.seller.description,
                joined: user.createdAt
            },
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};