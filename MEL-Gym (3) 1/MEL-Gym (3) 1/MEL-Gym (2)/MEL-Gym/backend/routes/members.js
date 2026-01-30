import express from "express";
import { db } from "../db.js";

const router = express.Router();

// ==============================
// GET all members
// ==============================
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      id,
      rfid,
      member_name,
      contact_number,
      email,
      address,
      membership_type,
      membership_start,
      membership_end,
      status
    FROM members
    ORDER BY id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching members:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(results);
  });
});

// ==============================
// GET stats for charts (Weekly & Monthly)
// ==============================
router.get("/stats", (req, res) => {
  // Weekly: count members with membership_type = 'Weekly', grouped by start week
  const sqlWeekly = `
    SELECT 
      COUNT(*) AS users,
      WEEK(membership_start, 1) AS week
    FROM members
    WHERE membership_type = 'Weekly'
    GROUP BY week
    ORDER BY week
  `;

  // Monthly: count members with membership_type = 'Monthly', grouped by start month
  const sqlMonthly = `
    SELECT 
      COUNT(*) AS users,
      MONTH(membership_start) AS month
    FROM members
    WHERE membership_type = 'Monthly'
    GROUP BY month
    ORDER BY month
  `;

  db.query(sqlWeekly, (errWeek, weeklyData) => {
    if (errWeek) {
      console.error("❌ Error fetching weekly stats:", errWeek);
      return res.status(500).json({ success: false, error: errWeek.message });
    }

    db.query(sqlMonthly, (errMonth, monthlyData) => {
      if (errMonth) {
        console.error("❌ Error fetching monthly stats:", errMonth);
        return res.status(500).json({ success: false, error: errMonth.message });
      }

      res.json({ weekly: weeklyData, monthly: monthlyData });
    });
  });
});

// ==============================
// GET member by ID with audit trail
// IMPORTANT: This must come BEFORE /:id route
// ==============================
router.get("/:id/audit", (req, res) => {
  const memberId = req.params.id;

  // First, get member data
  const memberSql = `
    SELECT 
      id,
      rfid,
      member_name as name,
      contact_number,
      email,
      address,
      membership_type as membershipType,
      membership_start as memberSince,
      membership_end as renewalDate,
      status as membershipStatus,
      DATEDIFF(membership_end, CURDATE()) as daysUntilRenewal
    FROM members
    WHERE id = ?
  `;

  // Get audit trail
  const auditSql = `
    SELECT 
      id,
      action,
      status,
      timestamp as createdAt
    FROM audit_trail
    ORDER BY timestamp DESC
    LIMIT 50
  `;

  db.query(memberSql, [memberId], (err, memberResults) => {
    if (err) {
      console.error("❌ Error fetching member:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    if (memberResults.length === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    db.query(auditSql, (errAudit, auditResults) => {
      if (errAudit) {
        console.error("❌ Error fetching audit trail:", errAudit);
        return res.status(500).json({ success: false, message: errAudit.message });
      }

      res.json({
        success: true,
        member: memberResults[0],
        audit: auditResults
      });
    });
  });
});

// ==============================
// GET single member by ID
// IMPORTANT: This must come AFTER /:id/audit route
// ==============================
router.get("/:id", (req, res) => {
  const memberId = req.params.id;

  const sql = `
    SELECT 
      id,
      rfid,
      member_name,
      contact_number,
      email,
      address,
      membership_type,
      membership_start,
      membership_end,
      status
    FROM members
    WHERE id = ?
  `;

  db.query(sql, [memberId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching member:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.json(results[0]);
  });
});

// ==============================
// 👤 Member Signup Route
// ==============================

// POST - Member Signup
router.post("/signup", (req, res) => {
  const { 
    member_name, 
    contact_number, 
    email, 
    address, 
    password, 
    membership_type, 
    status 
  } = req.body;

  console.log("📥 New member signup request:", { 
    member_name, 
    contact_number, 
    email, 
    membership_type 
  });

  // Validation
  if (!member_name || !contact_number || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, contact number, email, and password are required"
    });
  }

  // Check if member already exists
  const checkSql = `SELECT * FROM members WHERE contact_number = ? OR email = ?`;
  
  db.query(checkSql, [contact_number, email], (err, results) => {
    if (err) {
      console.error("❌ Error checking existing member:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        details: err.message
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Member with this contact number or email already exists"
      });
    }

    // Get membership start date (today)
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    // Calculate membership end date (30 days from start for monthly)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const membershipEnd = endDate.toISOString().split('T')[0];

    // Insert new member
    const insertSql = `
      INSERT INTO members 
      (member_name, contact_number, email, address, password, membership_type, membership_time, membership_start, membership_end, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      member_name.trim(),
      contact_number.trim(),
      email.trim(),
      address || "Not provided",
      password, // NOTE: In production, use bcrypt to hash passwords!
      membership_type || "Monthly",
      currentTime, // Just the time (HH:MM:SS)
      today,
      membershipEnd,
      status || "inactive"
    ];

    db.query(insertSql, values, (err, result) => {
      if (err) {
        console.error("❌ Error creating member account:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create member account",
          details: err.message
        });
      }

      console.log(`✅ Member created successfully with ID: ${result.insertId}`);

      res.status(201).json({
        success: true,
        message: "Member account created successfully! Please log in.",
        data: {
          id: result.insertId,
          member_name: member_name,
          email: email,
          contact_number: contact_number,
          membership_type: membership_type,
          status: status || "inactive"
        }
      });
    });
  });
});

export default router;