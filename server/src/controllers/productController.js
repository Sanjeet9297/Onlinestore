const Product = require("../models/productModel");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require("multer");
const { v4: uuidv4 } = require("crypto");

// ─── AWS S3 Config ────────────────────────────────────────────────────────────
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

// ─── Multer — memory storage ──────────────────────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Only image files are allowed"), false);
    },
});

// ─── Helper: Upload single buffer to S3 ──────────────────────────────────────
const uploadToS3 = async (file, folder = "products") => {
    const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

    const parallelUpload = new Upload({
        client: s3,
        params: {
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        },
    });

    await parallelUpload.done();

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, public_id: key }; // public_id = S3 key (used to delete later)
};

// ─── Helper: Delete from S3 ──────────────────────────────────────────────────
const deleteFromS3 = async (key) => {
    if (!key) return;
    await s3.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        })
    );
};

// ─── POST /product/ ─ Add Product ─────────────────────────────────────────────
const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, brand, sizes, newArrival } =
            req.body;

        if (!name || !price || !stock || !category) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        if (!req.files || req.files.length < 3) {
            return res.status(400).json({ message: "Minimum 3 images required" });
        }

        // Upload all images to S3 in parallel
        const uploadedImages = await Promise.all(req.files.map((f) => uploadToS3(f)));

        const newProduct = await Product.create({
            productName: name,
            description,
            price: Number(price),
            stock: Number(stock),
            category,
            brand,
            images: uploadedImages,
            sizes: sizes ? JSON.parse(sizes) : [],
            newArrival: newArrival === "true" || newArrival === true,
        });

        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /product/ ─ Fetch All Products ──────────────────────────────────────
const fetchProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate("category");
        res.status(200).json({ products });
    } catch (error) {
        console.error("Fetch products error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /product/productLimit?page=1&limit=5 ────────────────────────────────
const fetchProductsLimit = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate("category")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments();

        res.status(200).json({ products, totalProducts });
    } catch (error) {
        console.error("Fetch products limit error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /product/:id ─────────────────────────────────────────────────────────
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ product });
    } catch (error) {
        console.error("Get product error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── PUT /product/:id ─ Edit Product ─────────────────────────────────────────
const editProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product updated", product: updated });
    } catch (error) {
        console.error("Edit product error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── PATCH /product/toggle/:id ────────────────────────────────────────────────
const toggleProductState = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.isDeleted = !product.isDeleted;
        const updatedProduct = await product.save();

        res.status(200).json({
            message: `Product ${updatedProduct.isDeleted ? "unpublished" : "published"}`,
            updatedProduct,
        });
    } catch (error) {
        console.error("Toggle product error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── POST /product/upload ─ Upload single image (used in Edit) ────────────────
const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const { oldPublicId } = req.body;

        // Delete old image from S3 if key provided
        if (oldPublicId) {
            await deleteFromS3(oldPublicId);
        }

        const image = await uploadToS3(req.file);
        res.status(200).json({ image }); // { url, public_id }
    } catch (error) {
        console.error("Upload image error:", error);
        res.status(500).json({ message: "Image upload failed" });
    }
};

// ─── GET /product/filter-products ────────────────────────────────────────────
const filterProducts = async (req, res) => {
    try {
        const { categories, sortBy, page = 1, limit = 10, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let filter = { isDeleted: false };

        if (categories) {
            filter.category = { $in: categories.split(",") };
        }
        if (search) {
            filter.productName = { $regex: search, $options: "i" };
        }

        let sort = {};
        if (sortBy === "price_asc") sort.price = 1;
        else if (sortBy === "price_desc") sort.price = -1;
        else if (sortBy === "newest") sort.createdAt = -1;
        else sort.createdAt = -1;

        const products = await Product.find(filter)
            .populate("category")
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({ products, totalProducts });
    } catch (error) {
        console.error("Filter products error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /product/top-selling/products ───────────────────────────────────────
const getTopSellingProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false })
            .sort({ totalSold: -1 })
            .limit(5)
            .populate("category");
        res.status(200).json({ products });
    } catch (error) {
        console.error("Top selling error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /product/three/new-arrivals ─────────────────────────────────────────
const fetchThreeNewArrivals = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false, newArrival: true })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate("category");
        res.status(200).json({ products });
    } catch (error) {
        console.error("New arrivals error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    upload,
    addProduct,
    fetchProducts,
    fetchProductsLimit,
    getProduct,
    editProduct,
    toggleProductState,
    uploadImage,
    filterProducts,
    getTopSellingProducts,
    fetchThreeNewArrivals,
};
