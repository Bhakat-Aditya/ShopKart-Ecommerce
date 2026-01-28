import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import Product from '../models/product.model.js';

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

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
            res.status(201).json({ _id: user._id, email: user.email, message: "OTP sent to email" });
        } catch (error) {
            console.error(error);
            await User.findByIdAndDelete(user._id);
            res.status(500).json({ message: "Email could not be sent" });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
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
            res.json({ _id: user._id, email: user.email, message: "OTP sent" });
        } catch (error) {
            res.status(500).json({ message: "Email failed" });
        }
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

export const verifyOtpAndLogin = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (user && user.otp === otp && user.otpExpires > Date.now()) {
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerified = true;
        await user.save();

        // ✅ FIXED: Explicitly sending isSeller status
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isSeller: user.isSeller, // <--- THIS LINE IS CRITICAL
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
    }
};

// Address Controllers
export const addAddress = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const address = req.body;
        if (user.addresses.length === 0) address.isDefault = true;
        user.addresses.push(address);
        await user.save();
        res.json(user.addresses);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const getAddresses = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) res.json(user.addresses);
    else res.status(404).json({ message: 'User not found' });
};

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;

            // Only update password if sent
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                isSeller: updatedUser.isSeller,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.id;

        // FIX: Ensure wishlist array exists
        if (!user.wishlist) user.wishlist = [];

        // Check if product exists in wishlist (compare strings)
        const isWhitelisted = user.wishlist.some(id => id.toString() === productId);

        if (isWhitelisted) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
            await user.save();
            res.json({ message: "Removed from Wishlist", wishlist: user.wishlist });
        } else {
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: "Added to Wishlist", wishlist: user.wishlist });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWishlist = async (req, res) => {
    try {
        // FIX: Handle cases where user doc is old/missing wishlist field
        const user = await User.findById(req.user._id).populate('wishlist');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.wishlist || []);
    } catch (error) {
        console.error("Get Wishlist Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes
    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopKart - Reset Password OTP',
            otp: otp,
            message: `Your OTP to reset your password is ${otp}. It expires in 10 minutes.`
        });
        res.json({ message: "OTP sent to your email" });
    } catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(500).json({ message: "Email sending failed. Try again." });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.otp === otp && user.otpExpires > Date.now()) {
        user.password = password; // Mongoose pre-save hook will hash this
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Password Reset Successfully! Please Login." });
    } else {
        res.status(400).json({ message: "Invalid or Expired OTP" });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.isAdmin) {
                res.status(400).json({ message: 'Cannot delete Admin users' });
                return;
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            // Update Roles
            if (req.body.isAdmin !== undefined) user.isAdmin = req.body.isAdmin;
            if (req.body.isSeller !== undefined) {
                user.isSeller = req.body.isSeller;

                // CRITICAL FIX: If promoting to seller, ensure seller object exists
                if (user.isSeller && !user.seller) {
                    user.seller = {
                        name: user.name,
                        logo: "",
                        description: `Welcome to ${user.name}'s shop`,
                        rating: 0,
                        numReviews: 0
                    };
                }
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                isSeller: updatedUser.isSeller,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};