/**
 * Run this to create/reset the admin account:
 *    node src/seedAdmin.js
 */

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/adminModel");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
    process.exit(1);
}

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Delete existing admin if any
        await Admin.deleteMany({});
        console.log("🗑️  Old admin(s) removed");

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await Admin.create({
            email: ADMIN_EMAIL,
            password: hashedPassword,
        });

        console.log("✅ Admin created!");
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

seedAdmin();
