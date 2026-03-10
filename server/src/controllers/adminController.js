const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");

const generateAdminToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

// ─── POST /admin/admin-login ──────────────────────────────────────────────────
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateAdminToken(admin._id);

        res.status(200).json({ message: "Admin login successful", token });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /admin/all-users ─────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ allUsers: users, totalUsers: users.length });
    } catch (error) {
        console.error("Fetch all users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /admin/all-users-limit?page=1&limit=5 ───────────────────────────────
const getAllUsersPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const allUsers = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments();

        res.status(200).json({ allUsers, totalUsers });
    } catch (error) {
        console.error("Paginated users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── PATCH /admin/:userId/block ───────────────────────────────────────────────
const blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status: "blocked" },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User blocked", user });
    } catch (error) {
        console.error("Block user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── PATCH /admin/:userId/unblock ────────────────────────────────────────────
const unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { status: "active" },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User unblocked", user });
    } catch (error) {
        console.error("Unblock user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /admin/search-users?searchKey=...&page=1&limit=5 ────────────────────
const searchUsers = async (req, res) => {
    try {
        const { searchKey, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const query = searchKey
            ? {
                $or: [
                    { username: { $regex: searchKey, $options: "i" } },
                    { email: { $regex: searchKey, $options: "i" } },
                ],
            }
            : {};

        const allUsers = await User.find(query)
            .select("-password")
            .skip(skip)
            .limit(parseInt(limit));

        const totalUsers = await User.countDocuments(query);

        res.status(200).json({ allUsers, totalUsers });
    } catch (error) {
        console.error("Search users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /admin/search-products?searchKey=...&page=1&limit=5 ─────────────────
const searchProducts = async (req, res) => {
    try {
        const { searchKey, page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;

        const Product = require("../models/productModel");
        const query = searchKey
            ? {
                $or: [
                    { productName: { $regex: searchKey, $options: "i" } },
                    { brand: { $regex: searchKey, $options: "i" } },
                ],
            }
            : {};

        const products = await Product.find(query)
            .populate("category")
            .skip(skip)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({ products, totalProducts });
    } catch (error) {
        console.error("Search products error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    adminLogin,
    getAllUsers,
    getAllUsersPagination,
    blockUser,
    unblockUser,
    searchUsers,
    searchProducts,
};
