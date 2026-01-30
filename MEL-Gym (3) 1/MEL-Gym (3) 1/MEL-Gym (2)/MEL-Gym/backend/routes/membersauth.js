// backend/routes/memberAuth.js
import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = "your-secret-key";

// ================= MEMBER LOGIN =================
router.post("/login", (req, res) => {
  let { contact, password } = req.body;

  if (!contact || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both phone number and password",
    });
  }

  contact = contact.trim();
  password = password.trim();

  const memberQuery =
    "SELECT * FROM members WHERE contact_number = ? LIMIT 1";

  db.query(memberQuery, [contact], (err, results) => {
    if (err) {
      console.error("Database error (members):", err);
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

    const member = results[0];

    // 🚫 BLOCK INACTIVE MEMBERS
    if (member.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your membership is inactive. Please renew at the front desk.",
      });
    }

    // Compare passwords (plain text)
    if (password !== (member.password || "").trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: member.id,
        name: member.member_name,
        contact: member.contact_number,
        email: member.email,
        role: "member",
      },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: member.id,
        name: member.member_name,
        contact: member.contact_number,
        email: member.email,
        role: "member",
      },
    });
  });
});

export default router;