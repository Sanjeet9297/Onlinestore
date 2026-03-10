const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const adminProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verify it's an admin token
            const admin = await Admin.findById(decoded.id).select("-password");
            if (!admin) {
                return res.status(401).json({ message: "Not authorized as admin" });
            }

            req.admin = admin;
            next();
        } catch (error) {
            console.error("Admin auth error:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

module.exports = { adminProtect };
