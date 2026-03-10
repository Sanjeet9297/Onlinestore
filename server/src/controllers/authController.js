const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// ─── Helper: Generate JWT ────────────────────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

// ─── POST /user/signup ────────────────────────────────────────────────────────
const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
        });

        // Generate token
        const token = generateToken(newUser._id);

        res.status(201).json({
            message: "User registered successfully",
            token,
            newUser: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isVerified: newUser.isVerified,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── POST /user/login ─────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Google users cannot login with password
        if (user.googleID && !user.password) {
            return res
                .status(400)
                .json({ message: "Please log in using Google" });
        }

        // Check if blocked
        if (user.status === "blocked") {
            return res
                .status(403)
                .json({ message: "Your account has been blocked by the admin" });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── POST /user/googleUser ─────────────────────────────────────────────────────
const storeGoogleInfo = async (req, res) => {
    try {
        const { uid, name, email, profileImage } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ message: "Missing required Google info" });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // If user exists but is blocked
            if (user.status === "blocked") {
                return res
                    .status(403)
                    .json({ message: "Your account has been blocked by the admin" });
            }

            // Update googleID if not set
            if (!user.googleID) {
                user.googleID = uid;
                user.isVerified = true;
                if (profileImage) user.profileImage = profileImage;
                await user.save();
            }
        } else {
            // Create new Google user
            user = await User.create({
                username: name,
                email,
                googleID: uid,
                profileImage,
                isVerified: true,
                status: "active",
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                _id: user._id,
                uid: user.googleID,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── PATCH /user/ ─ Update username/email ─────────────────────────────────────
const updateUserData = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.user._id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email },
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({ message: "Profile updated", user: updatedUser });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── PUT /user/change-password ────────────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── POST /user/forgotPassword ────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // Generate 6-digit OTP code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetPasswordCode = resetCode;
        user.resetPasswordExpiry = expiry;
        await user.save();

        // TODO: Send email with resetCode using Nodemailer or similar
        console.log(`Reset code for ${email}: ${resetCode}`);

        res.status(200).json({ message: "Password reset code sent to your email" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── POST /user/forgotPassword-verify ────────────────────────────────────────
const forgotPasswordVerify = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (
            user.resetPasswordCode !== code ||
            user.resetPasswordExpiry < new Date()
        ) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordCode = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Forgot password verify error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET /user/users ─ Fetch all users ───────────────────────────────────────
const fetchUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ users });
    } catch (error) {
        console.error("Fetch users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    signUp,
    login,
    storeGoogleInfo,
    updateUserData,
    changePassword,
    forgotPassword,
    forgotPasswordVerify,
    fetchUsers,
};
