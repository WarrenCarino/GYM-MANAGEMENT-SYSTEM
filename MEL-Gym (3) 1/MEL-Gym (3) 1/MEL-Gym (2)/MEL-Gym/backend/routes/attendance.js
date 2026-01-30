// C:\Users\Rona\Desktop\MEL-Gym\backend\routes/attendance.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Helper to get PH DateTime
function getPHDateTime() {
  const now = new Date();
  const phTime = now.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  const phDate = now.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  return { phTime, phDate };
}

// ✅ GET all attendance records
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      a.id,
      COALESCE(m.member_name, w.fullname) AS fullName,
      COALESCE(m.rfid, w.RFID_number) AS rfid,
      DATE_FORMAT(a.scanned_at, '%Y-%m-%d') AS date,
      TIME_FORMAT(a.time_in, '%h:%i:%s %p') AS timeIn,
      TIME_FORMAT(a.time_out, '%h:%i:%s %p') AS timeOut,
      a.status
    FROM attendance_logs a
    LEFT JOIN members m ON a.member_id = m.id
    LEFT JOIN walk_in w ON a.walkin_id = w.walkin_id
    ORDER BY a.scanned_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching attendance:", err);
      return res.status(500).json({ success: false, error: "Failed to fetch attendance records" });
    }

    const { phDate, phTime } = getPHDateTime();
    res.json({ currentDate: phDate, currentTime: phTime, data: results });
  });
});

// 📌 GET today's attendance records
router.get("/today", (req, res) => {
  const { phDate, phTime } = getPHDateTime();

  const sql = `
    SELECT 
      a.id,
      COALESCE(m.member_name, w.fullname) AS fullName,
      COALESCE(m.rfid, w.RFID_number) AS rfid,
      DATE_FORMAT(a.scanned_at, '%Y-%m-%d') AS date,
      TIME_FORMAT(a.time_in, '%h:%i:%s %p') AS timeIn,
      TIME_FORMAT(a.time_out, '%h:%i:%s %p') AS timeOut,
      a.status
    FROM attendance_logs a
    LEFT JOIN members m ON a.member_id = m.id
    LEFT JOIN walk_in w ON a.walkin_id = w.walkin_id
    WHERE a.date = ?
    ORDER BY a.scanned_at DESC
  `;

  db.query(sql, [phDate], (err, records) => {
    if (err) {
      console.error("❌ Error fetching today's attendance:", err);
      return res.status(500).json({ success: false, error: "Failed to fetch today's attendance" });
    }

    // Count present members dynamically
    const currentPresent = records.filter(r => r.status === "Present").length;

    res.json({
      currentDate: phDate,
      currentTime: phTime,
      currentPresent,
      data: records
    });
  });
});

// ✅ POST - Record attendance (members + walk-ins)
router.post("/", (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ success: false, error: "RFID is required" });

  const { phDate, phTime } = getPHDateTime();

  // Check members first
  const memberQuery = `SELECT id, member_name, status FROM members WHERE rfid = ?`;
  db.query(memberQuery, [uid], (err, members) => {
    if (err) return res.status(500).json({ success: false, error: "Database error" });

    if (members.length > 0) {
      const member = members[0];
      if (member.status !== "active") {
        return res.status(403).json({ success: false, error: `Membership is ${member.status}`, currentDate: phDate, currentTime: phTime });
      }
      handleAttendance(member.id, null, member.member_name, phDate, phTime, res);
    } else {
      // Check walk-ins
      const walkinQuery = `SELECT walkin_id, fullname FROM walk_in WHERE RFID_number = ?`;
      db.query(walkinQuery, [uid], (walkErr, walkins) => {
        if (walkErr) return res.status(500).json({ success: false, error: "Database error" });
        if (walkins.length === 0) return res.status(404).json({ success: false, error: "Member/Walk-in not found", currentDate: phDate, currentTime: phTime });
        const walkin = walkins[0];
        handleAttendance(null, walkin.walkin_id, walkin.fullname, phDate, phTime, res);
      });
    }
  });
});

// Handle attendance logic
function handleAttendance(memberId, walkinId, name, phDate, phTime, res) {
  let checkSql = "", checkParams = [];
  if (memberId) {
    checkSql = `SELECT * FROM attendance_logs WHERE member_id = ? AND date = ? ORDER BY id DESC LIMIT 1`;
    checkParams = [memberId, phDate];
  } else {
    checkSql = `SELECT * FROM attendance_logs WHERE walkin_id = ? AND date = ? ORDER BY id DESC LIMIT 1`;
    checkParams = [walkinId, phDate];
  }

  db.query(checkSql, checkParams, (err, records) => {
    if (err) return res.status(500).json({ success: false, error: "Database error" });

    if (records.length === 0) {
      // Time In
      const insertSql = memberId
        ? `INSERT INTO attendance_logs (member_id, scanned_at, date, time_in, status) VALUES (?, NOW(), ?, NOW(), 'Present')`
        : `INSERT INTO attendance_logs (walkin_id, scanned_at, date, time_in, status) VALUES (?, NOW(), ?, NOW(), 'Present')`;

      const insertParams = memberId ? [memberId, phDate] : [walkinId, phDate];

      db.query(insertSql, insertParams, (insertErr) => {
        if (insertErr) return res.status(500).json({ success: false, error: "Failed to record attendance" });
        return res.json({ success: true, message: `✅ Time In recorded for ${name}`, action: "time_in", currentDate: phDate, currentTime: phTime });
      });
    } else {
      const lastRecord = records[0];
      if (!lastRecord.time_out || lastRecord.time_out === "00:00:00") {
        // Time Out
        const updateSql = `UPDATE attendance_logs SET time_out = NOW(), status = 'Completed' WHERE id = ?`;
        db.query(updateSql, [lastRecord.id], (updateErr) => {
          if (updateErr) return res.status(500).json({ success: false, error: "Failed to record attendance" });
          return res.json({ success: true, message: `👋 Time Out recorded for ${name}`, action: "time_out", currentDate: phDate, currentTime: phTime });
        });
      } else {
        return res.json({ success: true, message: `🕒 ${name} already completed attendance today.`, action: "none", currentDate: phDate, currentTime: phTime });
      }
    }
  });
}

// 📌 GET maximum capacity (fixed value)
router.get("/capacity", (req, res) => {
  const sql = `SELECT Capacity_number FROM capacity WHERE Capacity_id = 1 LIMIT 1`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: "Failed to fetch capacity" });
    const maxCapacity = results.length > 0 ? results[0].Capacity_number : 50; // default
    res.json({ success: true, maxCapacity });
  });
});

// 📌 POST - Update maximum capacity
router.post("/capacity", (req, res) => {
  const { maxCapacity } = req.body;
  if (!maxCapacity || isNaN(maxCapacity) || maxCapacity <= 0) return res.status(400).json({ success: false, error: "Invalid capacity value" });

  const sql = `INSERT INTO capacity (Capacity_id, Capacity_number) VALUES (1, ?) ON DUPLICATE KEY UPDATE Capacity_number = ?`;
  db.query(sql, [maxCapacity, maxCapacity], (err) => {
    if (err) return res.status(500).json({ success: false, error: "Failed to update capacity" });
    res.json({ success: true, message: "Maximum capacity updated", maxCapacity });
  });
});

export default router;
