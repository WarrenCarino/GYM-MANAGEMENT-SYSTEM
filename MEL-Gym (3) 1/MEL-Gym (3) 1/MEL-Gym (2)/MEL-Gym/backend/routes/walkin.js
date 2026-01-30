import express from "express";
import { db } from "../db.js";

const router = express.Router();

// 🕒 Helper: Get current PH date
function getPHDate() {
  const now = new Date();
  const phTime = now.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  const date = new Date(phTime);
  return date.toISOString().split("T")[0];
}

// 🧾 GET all walk-in records
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      walkin_id,
      fullname,
      RFID_number,
      DATE_FORMAT(date, '%Y-%m-%d') AS date
    FROM walk_in
    ORDER BY date DESC, walkin_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching walk-in records:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch walk-in records",
        details: err.message,
      });
    }

    res.json({ success: true, data: results });
  });
});

// ➕ POST new walk-in record (RFID detection from walk_in table only)
router.post("/", (req, res) => {
  console.log("📥 Received walk-in POST request:", req.body);

  const { fullname, RFID_number, RFID, date } = req.body;
  const rfidValue = RFID_number || RFID;

  // Missing fields check
  if (!fullname || !rfidValue) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({
      success: false,
      error: "Fullname and RFID_number are required",
    });
  }

  const walkinDate = date || getPHDate();

  // ✅ Check if RFID already exists in today's walk_in table
  const checkSql = `
    SELECT * FROM walk_in 
    WHERE RFID_number = ? AND DATE(date) = CURDATE()
  `;

  db.query(checkSql, [rfidValue], (err, existing) => {
    if (err) {
      console.error("❌ Error checking RFID in walk_in:", err);
      return res.status(500).json({
        success: false,
        error: "Database error while checking RFID",
        details: err.message,
      });
    }

    if (existing.length > 0) {
      console.warn("⚠️ RFID already used today");
      return res.status(400).json({
        success: false,
        error: "RFID already used today",
      });
    }

    // 🚀 Insert new walk-in
    const insertSql = `
      INSERT INTO walk_in (fullname, RFID_number, date)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [fullname, rfidValue, walkinDate], (err, result) => {
      if (err) {
        console.error("❌ Error creating walk-in record:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to create walk-in record",
          details: err.message,
        });
      }

      console.log("✅ Walk-in record created:", result.insertId);

      res.json({
        success: true,
        message: "Walk-in record created successfully",
        data: {
          walkin_id: result.insertId,
          fullname,
          RFID_number: rfidValue,
          date: walkinDate,
        },
      });
    });
  });
});

// 🛠 PUT - Update walk-in RFID
router.put("/:walkin_id", (req, res) => {
  const { walkin_id } = req.params;
  const { RFID_number } = req.body;

  console.log(`🛠 Updating RFID for walk-in ID ${walkin_id} → ${RFID_number}`);

  if (!RFID_number) {
    return res.status(400).json({
      success: false,
      error: "RFID_number is required",
    });
  }

  const sql = `UPDATE walk_in SET RFID_number = ? WHERE walkin_id = ?`;

  db.query(sql, [RFID_number, walkin_id], (err, result) => {
    if (err) {
      console.error("❌ Error updating RFID:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update RFID",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Walk-in not found",
      });
    }

    console.log(`✅ Walk-in ${walkin_id} RFID updated to: ${RFID_number}`);
    res.json({
      success: true,
      message: "RFID updated successfully",
      walkin_id: walkin_id,
      RFID_number: RFID_number,
    });
  });
});

// 🗑 DELETE walk-in
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const deleteSql = "DELETE FROM walk_in WHERE walkin_id = ?";
  db.query(deleteSql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting walk-in:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete walk-in record",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Walk-in record not found",
      });
    }

    res.json({
      success: true,
      message: "Walk-in record deleted successfully",
    });
  });
});

export default router;