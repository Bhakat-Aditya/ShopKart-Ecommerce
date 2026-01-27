import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './config/db.config.js';
import path from 'path'; 
import fs from 'fs'; 

// import routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import sellerRoutes from './routes/seller.routes.js';

const __dirname = path.resolve();
if (!fs.existsSync(path.join(__dirname, '/uploads'))) {
    fs.mkdirSync(path.join(__dirname, '/uploads'));
}

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to the database
connectDb();

// Middleware

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// json parsing
app.use(express.json());

// routes

// Auth route
app.use('/api/users', authRoutes);
// Product route
app.use('/api/products', productRoutes);
// Order route
app.use('/api/orders', orderRoutes);
// Upload route
app.use('/api/upload', uploadRoutes);
// Payment route
app.use('/api/payment', paymentRoutes);
// Seller route
app.use('/api/seller', sellerRoutes);


// Test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on mode port ${PORT}`);
});

export default app;