import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Check if the Authorization header exists and starts with "Bearer"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Get the token from the header (remove "Bearer " string)
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user from the database (exclude password) and attach to req
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Move to the next middleware/controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export const seller = (req, res, next) => {
    if (req.user && (req.user.isSeller || req.user.isAdmin)) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a seller' });
    }
};