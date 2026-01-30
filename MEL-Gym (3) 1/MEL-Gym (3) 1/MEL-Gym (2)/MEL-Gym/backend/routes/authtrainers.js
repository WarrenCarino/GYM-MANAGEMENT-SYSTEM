// C:\Users\Rona\Desktop\MEL-Gym\backend\routes\authtrainers.js
import express from "express";
import { db } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// JWT Secret (you should move this to environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// ================================
// 🔐 TRAINER LOGIN
// ================================
router.post("/login", (req, res) => {
    const { contact_number, password } = req.body;

    // Validation
    if (!contact_number || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide both contact number and password" 
        });
    }

    console.log("Login attempt for contact_number:", contact_number);

    const sql = `
        SELECT * FROM trainers_table
        WHERE contact_number = ? AND password = ?
    `;

    db.query(sql, [contact_number, password], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Database error" 
            });
        }

        if (results.length > 0) {
            const trainer = results[0];
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: trainer.id, 
                    contact_number: trainer.contact_number,
                    name: trainer.name 
                },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Remove password from response
            const { password: _, ...trainerWithoutPassword } = trainer;

            return res.json({ 
                success: true, 
                token: token,
                user: trainerWithoutPassword
            });
        }

        return res.status(401).json({ 
            success: false, 
            message: "Invalid contact number or password" 
        });
    });
});

export default router;