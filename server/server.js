import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './config/db.config.js';

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
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on mode port ${PORT}`);
});
    
export default app;