import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Sub-schema for Seller Details
const sellerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String },
    description: { type: String, required: true },
    rating: { type: Number, default: 0, required: true },
    numReviews: { type: Number, default: 0, required: true },
});

const addressSchema = mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false }, // Kept for legacy, but we use isSeller now

    // --- NEW: Seller Flags ---
    isSeller: { type: Boolean, default: false },
    seller: sellerSchema, // Stores shop info

    addresses: [addressSchema],
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false }
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", userSchema);