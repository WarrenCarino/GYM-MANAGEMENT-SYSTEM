// C:\Users\Rona\Desktop\MEL-Gym\backend\routes\auditTrail.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Helper function to get user name by ID and role
const getUserNameByIdAndRole = (id, role) => {
  return new Promise((resolve) => {
    let query = "";
    
    if (role === "admin") {
      query = "SELECT name FROM admin_table WHERE admin_id = ?";
    } else if (role === "cashier") {
      query = "SELECT name FROM cashiers_login WHERE id = ?";
    } else if (role === "trainer") {
      query = "SELECT name FROM trainers_table WHERE id = ?";
    } else if (role === "member") {
      query = "SELECT member_name as name FROM members WHERE id = ?";
    } else {
      resolve(null);
      return;
    }

    db.query(query, [id], (err, results) => {
      if (err || !results || results.length === 0) {
        resolve(null);
      } else {
        resolve(results[0].name);
      }
    });
  });
};

// ==============================
// 📋 GET - Fetch all audit trail records with names
// ==============================
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      audit_id,
      id,
      role,
      action,
      status,
      timestamp
    FROM audit_trail
    ORDER BY timestamp DESC
  `;

  db.query(sql, async (err, results) => {
    if (err) {
      console.error("❌ Error fetching audit trail:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch audit trail",
        details: err.message
      });
    }

    // Fetch names for each record
    const enrichedResults = await Promise.all(
      results.map(async (record) => {
        const name = await getUserNameByIdAndRole(record.id, record.role);
        return {
          audit_id: record.audit_id,
          user_name: name || "Unknown User",
          role: record.role,
          action: record.action,
          status: record.status,
          timestamp: record.timestamp
        };
      })
    );

    console.log(`✅ Fetched ${enrichedResults.length} audit trail records with names`);
    res.json({
      success: true,
      count: enrichedResults.length,
      data: enrichedResults
    });
  });
});

// ==============================
// 📋 GET - Fetch audit trail by user name with name
// ==============================
router.get("/:name", (req, res) => {
  const { name } = req.params;

  console.log(`📥 Fetching audit trail for user name: ${name}`);

  const sql = `
    SELECT 
      audit_id,
      id,
      role,
      action,
      status,
      timestamp
    FROM audit_trail
    ORDER BY timestamp DESC
  `;

  db.query(sql, async (err, results) => {
    if (err) {
      console.error("❌ Error fetching audit trail:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch audit trail for user",
        details: err.message
      });
    }

    // Filter and enrich results
    const enrichedResults = await Promise.all(
      results.map(async (record) => {
        const userName = await getUserNameByIdAndRole(record.id, record.role);
        return {
          audit_id: record.audit_id,
          user_name: userName || "Unknown User",
          role: record.role,
          action: record.action,
          status: record.status,
          timestamp: record.timestamp
        };
      })
    );

    // Filter by name
    const filtered = enrichedResults.filter(record =>
      record.user_name.toLowerCase().includes(name.toLowerCase())
    );

    if (filtered.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No audit trail records found for this user"
      });
    }

    console.log(`✅ Fetched ${filtered.length} audit records for user ${name}`);
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  });
});

// ==============================
// 📋 GET - Fetch audit trail by role with names
// ==============================
router.get("/filter/role/:role", (req, res) => {
  const { role } = req.params;

  console.log(`📥 Fetching audit trail for role: ${role}`);

  const sql = `
    SELECT 
      audit_id,
      id,
      role,
      action,
      status,
      timestamp
    FROM audit_trail
    WHERE role = ?
    ORDER BY timestamp DESC
  `;

  db.query(sql, [role], async (err, results) => {
    if (err) {
      console.error("❌ Error fetching audit trail by role:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch audit trail by role",
        details: err.message
      });
    }

    // Fetch names for each record
    const enrichedResults = await Promise.all(
      results.map(async (record) => {
        const name = await getUserNameByIdAndRole(record.id, record.role);
        return {
          audit_id: record.audit_id,
          user_name: name || "Unknown User",
          role: record.role,
          action: record.action,
          status: record.status,
          timestamp: record.timestamp
        };
      })
    );

    console.log(`✅ Fetched ${enrichedResults.length} audit records for role: ${role}`);
    res.json({
      success: true,
      count: enrichedResults.length,
      data: enrichedResults
    });
  });
});

// ==============================
// 📋 GET - Fetch audit trail by date range with names
// ==============================
router.get("/filter/date-range", (req, res) => {
  const { startDate, endDate } = req.query;

  console.log(`📥 Fetching audit trail from ${startDate} to ${endDate}`);

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      error: "startDate and endDate query parameters are required"
    });
  }

  const sql = `
    SELECT 
      audit_id,
      id,
      role,
      action,
      status,
      timestamp
    FROM audit_trail
    WHERE DATE(timestamp) BETWEEN ? AND ?
    ORDER BY timestamp DESC
  `;

  db.query(sql, [startDate, endDate], async (err, results) => {
    if (err) {
      console.error("❌ Error fetching audit trail by date range:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch audit trail by date range",
        details: err.message
      });
    }

    // Fetch names for each record
    const enrichedResults = await Promise.all(
      results.map(async (record) => {
        const name = await getUserNameByIdAndRole(record.id, record.role);
        return {
          audit_id: record.audit_id,
          user_name: name || "Unknown User",
          role: record.role,
          action: record.action,
          status: record.status,
          timestamp: record.timestamp
        };
      })
    );

    console.log(`✅ Fetched ${enrichedResults.length} audit records between ${startDate} and ${endDate}`);
    res.json({
      success: true,
      count: enrichedResults.length,
      data: enrichedResults
    });
  });
});

// ==============================
// 📋 GET - Fetch audit trail by action with names
// ==============================
router.get("/filter/action/:action", (req, res) => {
  const { action } = req.params;

  console.log(`📥 Fetching audit trail for action: ${action}`);

  const sql = `
    SELECT 
      audit_id,
      id,
      role,
      action,
      status,
      timestamp
    FROM audit_trail
    WHERE action = ?
    ORDER BY timestamp DESC
  `;

  db.query(sql, [action], async (err, results) => {
    if (err) {
      console.error("❌ Error fetching audit trail by action:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch audit trail by action",
        details: err.message
      });
    }

    // Fetch names for each record
    const enrichedResults = await Promise.all(
      results.map(async (record) => {
        const name = await getUserNameByIdAndRole(record.id, record.role);
        return {
          audit_id: record.audit_id,
          user_name: name || "Unknown User",
          role: record.role,
          action: record.action,
          status: record.status,
          timestamp: record.timestamp
        };
      })
    );

    console.log(`✅ Fetched ${enrichedResults.length} audit records for action: ${action}`);
    res.json({
      success: true,
      count: enrichedResults.length,
      data: enrichedResults
    });
  });
});

// ==============================
// 📋 GET - Fetch audit trail statistics
// ==============================
router.get("/stats/overview", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as totalRecords,
      COUNT(DISTINCT id) as uniqueUsers,
      COUNT(DISTINCT role) as uniqueRoles,
      COUNT(DISTINCT action) as uniqueActions
    FROM audit_trail
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching audit trail stats:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch audit trail statistics",
        details: err.message
      });
    }

    console.log(`✅ Fetched audit trail statistics`);
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// ==============================
// 📋 POST - Create audit trail record
// ==============================
router.post("/", (req, res) => {
  const { id, role, action, status } = req.body;

  console.log(`📝 Logging audit trail:`, { id, role, action, status });

  if (!id || !role || !action || !status) {
    return res.status(400).json({
      success: false,
      error: "id, role, action, and status are required"
    });
  }

  const sql = `
    INSERT INTO audit_trail (id, role, action, status, timestamp)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [id, role, action, status], (err, result) => {
    if (err) {
      console.error("❌ Error logging audit trail:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to log audit trail",
        details: err.message
      });
    }

    console.log(`✅ Audit trail logged successfully for ${id}`);
    res.status(201).json({
      success: true,
      message: "Audit trail logged",
      audit_id: result.insertId
    });
  });
});

// ==============================
// 🗑️ DELETE - Delete audit trail record by ID
// ==============================
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  console.log(`🗑️ Deleting audit trail record ID: ${id}`);

  const sql = `DELETE FROM audit_trail WHERE audit_id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting audit trail:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete audit trail record",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Audit trail record not found"
      });
    }

    console.log(`✅ Audit trail record ${id} deleted successfully`);
    res.json({
      success: true,
      message: "Audit trail record deleted successfully"
    });
  });
});

export default router;