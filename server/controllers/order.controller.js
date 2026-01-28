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

        // Reduce Stock
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
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSellerOrders = async (req, res) => {
    try {
        const products = await Product.find({ user: req.user._id });
        const sellerProductIds = products.map(p => p._id.toString());

        const orders = await Order.find({
            "orderItems.product": { $in: products.map(p => p._id) }
        })
            .populate('user', 'id name email')
            .sort({ createdAt: -1 });

        const sanitizedOrders = orders.map(order => {
            const orderDoc = order.toObject();
            orderDoc.orderItems = orderDoc.orderItems.filter(item =>
                sellerProductIds.includes(item.product.toString())
            );
            orderDoc.sellerTotal = orderDoc.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
            return orderDoc;
        });

        res.json(sanitizedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- THIS IS THE FUNCTION YOU WERE MISSING ---
export const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email,
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};