const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/productController");

const { adminProtect } = require("../middleware/adminAuthMiddleware");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get("/", fetchProducts);
router.get("/productLimit", fetchProductsLimit);
router.get("/filter-products", filterProducts);
router.get("/top-selling/products", getTopSellingProducts);
router.get("/three/new-arrivals", fetchThreeNewArrivals);
router.get("/:id", getProduct);

// ─── Admin Protected Routes ───────────────────────────────────────────────────
router.post("/", adminProtect, upload.array("images", 5), addProduct);
router.put("/:id", adminProtect, editProduct);
router.patch("/toggle/:id", adminProtect, toggleProductState);
router.post("/upload", adminProtect, upload.single("file"), uploadImage);

module.exports = router;
