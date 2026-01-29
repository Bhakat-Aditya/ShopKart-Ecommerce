import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from './config/db.config.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import sellerRoutes from './routes/seller.routes.js';

// 1. Load Env & Connect DB (Order matters!)
dotenv.config();
connectDb();

const app = express();

// 2. Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());

// 3. Static Files (Dual Support for Local & Vercel)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/server/uploads')));
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// 4. Routes
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/seller', sellerRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// 5. INLINE Error Handler (Replaces external file to prevent crashes)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    console.error("SERVER ERROR:", err.message); // <--- LOGS ERROR TO TERMINAL
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// 6. Vercel & Local Listener
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

export default app;