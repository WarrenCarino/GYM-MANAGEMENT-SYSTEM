import express from "express";
import { db } from "../db.js";

const router = express.Router();

// ==============================
// GET ALL TRAINERS
// ==============================
router.get("/all", (req, res) => {
  const sql = `
    SELECT 
      id AS trainer_id,
      name AS trainer_name,
      email,
      contact_number,
      password,
      session_type,
      status
    FROM trainers_table
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching trainers:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch trainers",
        details: err.message,
      });
    }

    res.json({
      success: true,
      trainers: results,
    });
  });
});

// ==============================
// UPDATE SESSION TYPE
// ==============================
router.put("/:id/session-type", (req, res) => {
  const { id } = req.params;
  const { session_type } = req.body;

  if (!session_type) {
    return res.status(400).json({
      success: false,
      error: "session_type is required",
    });
  }

  const sql = `
    UPDATE trainers_table
    SET session_type = ?
    WHERE id = ?
  `;

  db.query(sql, [session_type, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating session type:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update session type",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Trainer not found",
      });
    }

    res.json({
      success: true,
      message: "Session type updated successfully",
    });
  });
});

export default router;
