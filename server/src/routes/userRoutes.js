const express = require("express");
const router = express.Router();

const {
    signUp,
    login,
    storeGoogleInfo,
    updateUserData,
    changePassword,
    forgotPassword,
    forgotPasswordVerify,
    fetchUsers,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/signup", signUp);
router.post("/login", login);
router.post("/googleUser", storeGoogleInfo);
router.post("/forgotPassword", forgotPassword);
router.post("/forgotPassword-verify", forgotPasswordVerify);

// ─── Protected Routes (require valid JWT) ─────────────────────────────────────
router.patch("/", protect, updateUserData);
router.put("/change-password", protect, changePassword);
router.get("/users", protect, fetchUsers);

module.exports = router;
