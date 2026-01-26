import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // 2. Hash the password (Security Best Practice)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        if (user) {
            // 4. Send response with a token
            res.status(201).json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check for user email
        const user = await User.findOne({ email });

        // 2. Check password matches
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                success: true,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};