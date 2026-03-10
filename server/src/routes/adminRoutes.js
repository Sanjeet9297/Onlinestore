const express = require("express");
const router = express.Router();

const {
    adminLogin,
    getAllUsers,
    getAllUsersPagination,
    blockUser,
    unblockUser,
    searchUsers,
    searchProducts,
} = require("../controllers/adminController");

const { adminProtect } = require("../middleware/adminAuthMiddleware");

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/admin-login", adminLogin);

// ─── Protected (admin token required) ────────────────────────────────────────
router.get("/all-users", adminProtect, getAllUsers);
router.get("/all-users-limit", adminProtect, getAllUsersPagination);
router.patch("/:userId/block", adminProtect, blockUser);
router.patch("/:userId/unblock", adminProtect, unblockUser);
router.get("/search-users", adminProtect, searchUsers);
router.get("/search-products", adminProtect, searchProducts);

module.exports = router;
