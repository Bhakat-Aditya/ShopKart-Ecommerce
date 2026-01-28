import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

export const addOrderItems = async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid,
        paymentResult,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order = new Order({
            orderItems: orderItems.map((x) => ({
                ...x,
                product: x._id,
                _id: undefined
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: isPaid || false,
            paidAt: isPaid ? Date.now() : null,
            paymentResult: paymentResult || {},
        });

        const createdOrder = await order.save();

        for (const item of orderItems) {
            const product = await Product.findById(item._id);
            if (product) {
                product.countInStock = product.countInStock - item.qty;
                await product.save();
            }
        }
        res.status(201).json(createdOrder);
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check if already delivered
            if (order.isDelivered) {
                return res.status(400).json({ message: 'Cannot cancel a delivered order' });
            }
            // Check if already cancelled
            if (order.isCancelled) {
                return res.status(400).json({ message: 'Order is already cancelled' });
            }

            // 1. Mark as Cancelled
            order.isCancelled = true;
            order.cancelledAt = Date.now();

            // 2. RESTORE STOCK (Loop through items and add quantity back)
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.countInStock = product.countInStock + item.qty;
                    await product.save();
                }
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        // 1. Get all product IDs belonging to this seller
        const products = await Product.find({ user: req.user._id });
        const sellerProductIds = products.map(p => p._id.toString());

        // 2. Find orders that contain ANY of these products
        const orders = await Order.find({
            "orderItems.product": { $in: products.map(p => p._id) }
        })
            .populate('user', 'id name email') // Get customer details
            .sort({ createdAt: -1 });

        // 3. Sanitize: Filter out items that don't belong to this seller
        const sanitizedOrders = orders.map(order => {
            const orderDoc = order.toObject(); // Convert to plain JS object

            // Keep only THIS seller's items
            orderDoc.orderItems = orderDoc.orderItems.filter(item =>
                sellerProductIds.includes(item.product.toString())
            );

            // Recalculate total price for THIS seller (optional but good for display)
            orderDoc.sellerTotal = orderDoc.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);

            return orderDoc;
        });

        res.json(sanitizedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};