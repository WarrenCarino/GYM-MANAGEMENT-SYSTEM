// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = "your-secret-key";

// ============= CASHIER LOGIN ONLY =============
router.post("/login", (req, res) => {
  const { contact, password } = req.body;

  if (!contact || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both phone number and password",
    });
  }

  // Check in cashiers_login table ONLY
  const cashierQuery = "SELECT * FROM cashiers_login WHERE phone = ? LIMIT 1";
  db.query(cashierQuery, [contact], (err, results) => {
    if (err) {
      console.error("Database error (cashier):", err);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    const cashier = results[0];

    // Compare passwords (plain text)
    if (password.trim() !== (cashier.password || "").trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    // Generate JWT for cashier
    const token = jwt.sign(
      {
        id: cashier.id,
        name: cashier.name,
        phone: cashier.phone,
        email: cashier.email,
        role: "cashier",
      },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: cashier.id,
        name: cashier.name,
        phone: cashier.phone,
        email: cashier.email,
        role: "cashier",
      },
    });
  });
});

export default router;
