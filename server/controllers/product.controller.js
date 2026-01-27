import Product from '../models/product.model.js';

// @desc    Fetch all products (Public - For Homepage/Search)
export const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
        const category = req.query.category ? { category: req.query.category } : {};

        const pageSize = Number(req.query.limit) || 8;
        const page = Number(req.query.pageNumber) || 1;
        const count = await Product.countDocuments({ ...keyword, ...category });

        const products = await Product.find({ ...keyword, ...category })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({ products, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Logged-in Seller's Products (NEW)
// @route   GET /api/products/myproducts
export const getMyProducts = async (req, res) => {
    try {
        // Only find products where "user" matches the logged-in ID
        const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Single Product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a Product
export const createProduct = async (req, res) => {
    try {
        const product = new Product({
            name: 'Sample Product',
            price: 0,
            user: req.user._id, // Owner is the Seller
            image: '/images/sample.jpg',
            brand: 'Sample Brand',
            category: 'Sample Category',
            countInStock: 0,
            numReviews: 0,
            description: 'Sample description',
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a Product
export const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, category, countInStock } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            // SECURITY CHECK: Does this product belong to the logged-in user?
            if (product.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: "Not authorized to edit this product" });
            }

            product.name = name;
            product.price = price;
            product.description = description;
            product.image = image;
            product.brand = brand;
            product.category = category;
            product.countInStock = countInStock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a Product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // SECURITY CHECK: Does this product belong to the logged-in user?
            if (product.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: "Not authorized to delete this product" });
            }

            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Review
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );
            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
            };
            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};