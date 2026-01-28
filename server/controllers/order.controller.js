import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import sendEmail from '../utils/sendEmail.js';
import { orderConfirmationTemplate, orderStatusTemplate } from '../utils/emailTemplates.js';

// 1. Create Order
export const addOrderItems = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    const order = new Order({
        orderItems: orderItems.map((x) => ({ ...x, product: x._id, _id: undefined })),
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false
    });

    const createdOrder = await order.save();

    // Reduce Stock
    for (const item of orderItems) {
        const product = await Product.findById(item._id);
        if (product) {
            product.countInStock -= item.qty;
            await product.save();
        }
    }

    try {
        const emailOrder = { ...createdOrder._doc, user: req.user };
        await sendEmail({
            email: req.user.email,
            subject: `Order Confirmed: #${createdOrder._id}`,
            html: orderConfirmationTemplate(emailOrder),
            message: `Your order ${createdOrder._id} has been placed.`
        });
    } catch (error) {
        console.error("Email Error:", error);
        // Don't fail the order just because email failed
    }
    // --------------------------------------

    res.status(201).json(createdOrder);
};

// 2. Get Order By ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) res.json(order);
        else res.status(404).json({ message: 'Order not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update Order to Paid
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

// 4. Get My Orders (Customer)
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Get Seller Orders (Seller)
export const getSellerOrders = async (req, res) => {
    try {
        const products = await Product.find({ user: req.user._id });
        const sellerProductIds = products.map(p => p._id.toString());

        const orders = await Order.find({
            "orderItems.product": { $in: products.map(p => p._id) }
        }).populate('user', 'id name email').sort({ createdAt: -1 });

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

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Check ownership
            if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(401).json({ message: "Not authorized to cancel this order" });
            }

            // Restore Stock
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.countInStock += item.qty;
                    await product.save();
                }
            }

            await order.deleteOne();
            res.json({ message: 'Order Cancelled Successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderToDelivered = async (req, res) => {
    try {
        // Populate user to get email for notification
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            order.orderStatus = 'Delivered';

            const updatedOrder = await order.save();

            // --- SEND EMAIL: DELIVERED ---
            try {
                await sendEmail({
                    email: order.user.email,
                    subject: `Delivered: Your ShopKart Order #${order._id}`,
                    html: orderStatusTemplate(order, "Delivered"),
                    message: `Your order ${order._id} has been delivered.`
                });
            } catch (error) { console.error("Email Error:", error); }
            // -----------------------------

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const ordersCount = await Order.countDocuments();
        const salesData = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }
        ]);
        const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;
        const usersCount = await User.countDocuments();
        const sellersCount = await User.countDocuments({ isSeller: true });
        const productsCount = await Product.countDocuments();
        const recentOrders = await Order.find({})
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            ordersCount,
            totalSales,
            usersCount,
            sellersCount,
            productsCount,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- NEW: Update Order Status & Logistics ---
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, date } = req.body;
        // Populate user to get email
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            order.orderStatus = status;
            if (date) order.expectedDelivery = date;

            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }

            const updatedOrder = await order.save();

            // --- SEND EMAIL: STATUS UPDATE (Shipped/Delivered) ---
            if (status === "Shipped" || status === "Out for Delivery" || status === "Delivered") {
                try {
                    await sendEmail({
                        email: order.user.email,
                        subject: `Update: Your Order is ${status}`,
                        html: orderStatusTemplate(order, status),
                        message: `Your order status is now: ${status}`
                    });
                } catch (error) { console.error("Email Error:", error); }
            }
            // -----------------------------------------------------

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};