import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error("Token verification failed:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const seller = (req, res, next) => {
    // LOGGING TO DEBUG 401 ERRORS
    if (req.user && (req.user.isSeller || req.user.isAdmin)) {
        next();
    } else {
        console.log(`[AUTH FAIL] User: ${req.user?.name} | IsSeller: ${req.user?.isSeller}`);
        res.status(401).json({ message: 'Not authorized as a seller' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};