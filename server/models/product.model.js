import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, "Please add a product name"],
        trim: true
    },
    image: {
        type: String,
        required: [true, "Please add an image URL"]
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: [true, "Please add a category"]
    },
    description: {
        type: String,
        required: [true, "Please add a description"]
    },
    price: {
        type: Number,
        required: [true, "Please add a price"],
        default: 0
    },
    countInStock: {
        type: Number,
        required: [true, "Please add stock count"],
        default: 0
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model("Product", productSchema);