import Product from '../models/product.model.js';

export const getProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
        const category = req.query.category ? { category: req.query.category } : {};
        const filter = { ...keyword, ...category, isPublished: true };

        const pageSize = Number(req.query.limit) || 8;
        const page = Number(req.query.pageNumber) || 1;
        const count = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({ products, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('user', 'name seller');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        // FIXED: Using "Placeholder" text instead of empty strings to pass Mongoose Validation
        const product = new Product({
            name: 'New Product Name', 
            price: 0,
            mrp: 0,
            user: req.user._id,
            image: '/images/sample.jpg', // Valid placeholder path
            brand: 'Brand Name',
            category: 'Category',
            countInStock: 0,
            numReviews: 0,
            description: 'Please add a description.',
            isPublished: false 
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        // Log the exact validation error for debugging
        console.error("Create Product Error:", error); 
        res.status(500).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        // Added 'mrp' to body destructuring
        const { name, price, mrp, description, image, brand, category, countInStock } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            if (product.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: "Not authorized to edit this product" });
            }

            product.name = name;
            product.price = price;
            product.mrp = mrp; // Update MRP
            product.description = description;
            product.image = image;
            product.brand = brand;
            product.category = category;
            product.countInStock = countInStock;
            product.isPublished = true;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            if (product.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: "Not authorized" });
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
