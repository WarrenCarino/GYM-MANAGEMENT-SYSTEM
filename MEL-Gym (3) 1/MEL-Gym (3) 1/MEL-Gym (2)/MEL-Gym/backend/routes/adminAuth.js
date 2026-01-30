// backend/routes/adminAuth.js
import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = "your-secret-key";

// ================= ADMIN LOGIN =================
router.post("/login", (req, res) => {
  const { contact, password } = req.body;

  console.log("=".repeat(50));
  console.log("📥 LOGIN ATTEMPT");
  console.log("Contact received:", contact);
  console.log("Password received:", password);
  console.log("=".repeat(50));

  if (!contact || !password) {
    console.log("❌ Missing contact or password");
    return res.status(400).json({
      success: false,
      message: "Please provide both phone number and password",
    });
  }

  // ✅ FIXED: Use admin_table instead of admin
  const adminQuery = "SELECT * FROM admin_table WHERE contact = ? LIMIT 1";
  
  console.log("🔍 Executing query:", adminQuery);
  console.log("🔍 With contact:", contact);
  
  db.query(adminQuery, [contact], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }

    console.log("📊 Query returned", results.length, "results");
    
    if (results.length === 0) {
      console.log("❌ No admin found with contact:", contact);
      
      // Let's check what's actually in the database
      db.query("SELECT contact FROM admin_table", (err2, allAdmins) => {
        if (!err2) {
          console.log("📋 All contacts in database:", allAdmins.map(a => a.contact));
        }
      });
      
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    const admin = results[0];
    console.log("✅ Admin found!");
    console.log("   Name:", admin.name);
    console.log("   Contact from DB:", admin.contact);
    console.log("   Password from DB:", admin.password);
    console.log("   Role:", admin.role);
    console.log("   Status:", admin.status);

    // Check if status is Active
    if (admin.status !== 'Active') {
      console.log("❌ Admin account is not active:", admin.status);
      return res.status(401).json({
        success: false,
        message: "Account is not active",
      });
    }

    // Check role
    const adminRole = (admin.role || "").trim().toLowerCase();
    console.log("🔍 Role check - DB role:", adminRole);
    
    if (adminRole !== "admin") {
      console.log("❌ Role check failed. Expected 'admin', got:", adminRole);
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    // Compare passwords
    const dbPassword = (admin.password || "").trim();
    const inputPassword = password.trim();
    
    console.log("🔍 Password comparison:");
    console.log("   DB password:", dbPassword);
    console.log("   Input password:", inputPassword);
    console.log("   Match:", dbPassword === inputPassword);

    if (inputPassword !== dbPassword) {
      console.log("❌ Password mismatch!");
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    console.log("✅ Login successful for:", admin.name);

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin.admin_id,
        name: admin.name,
        contact: admin.contact,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    console.log("✅ Token generated successfully");
    console.log("=".repeat(50));

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin.admin_id,
        name: admin.name,
        contact: admin.contact,
        email: admin.email,
        role: admin.role,
      },
    });
  });
});

export default router;