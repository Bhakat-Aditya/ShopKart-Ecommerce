import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register & Send OTP
// @route   POST /api/users
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    // Create user but NOT verified yet
    const user = await User.create({
        name, email, password, otp, otpExpires, isVerified: false
    });

    if (user) {
        try {
            await sendEmail({
                email: user.email,
                subject: 'ShopKart - Verify Your Email',
                otp: otp,
                message: `Your OTP for registration is ${otp}`
            });
            res.status(201).json({
                _id: user._id,
                email: user.email,
                message: "OTP sent to email"
            });
        } catch (error) {
            await User.findByIdAndDelete(user._id); // Rollback
            res.status(500).json({ message: "Email could not be sent" });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Login Step 1: Check Password & Send OTP
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // Generate new OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'ShopKart - Login OTP',
                otp: otp,
                message: `Your OTP for login is ${otp}`
            });
            // Don't send token yet!
            res.json({
                _id: user._id,
                email: user.email,
                message: "OTP sent"
            });
        } catch (error) {
            res.status(500).json({ message: "Email failed" });
        }
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Verify OTP & Get Token (Step 2 for both Login/Register)
// @route   POST /api/users/verify-otp
export const verifyOtpAndLogin = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (user && user.otp === otp && user.otpExpires > Date.now()) {
        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerified = true;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
    }
};

// --- ADDRESS BOOK CONTROLLERS ---

// @desc    Add Address
// @route   POST /api/users/address
export const addAddress = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const address = req.body;
        // If it's the first address, make it default
        if (user.addresses.length === 0) address.isDefault = true;

        user.addresses.push(address);
        await user.save();
        res.json(user.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get Addresses
// @route   GET /api/users/address
export const getAddresses = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) res.json(user.addresses);
    else res.status(404).json({ message: 'User not found' });
};