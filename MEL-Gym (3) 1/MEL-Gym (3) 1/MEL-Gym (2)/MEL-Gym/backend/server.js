// C:\Users\Rona\Desktop\MEL-Gym\backend\server.js
import express from "express";
import cors from "cors";
import { db } from "./db.js";

import authRoutes from "./routes/auth.js";
import cashierRoutes from "./routes/cashier.js";
import attendanceRoutes from "./routes/attendance.js";
import walkinRoutes from "./routes/walkin.js";
import membersAuthRoutes from "./routes/membersauth.js";
import membersRoutes from "./routes/members.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import membershipRoutes from "./routes/membership.js";
import authTrainersRoutes from "./routes/authtrainers.js";
import auditTrailRoutes from "./routes/auditTrail.js";
import trainersRoutes from "./routes/trainers.js";
const app = express();
const PORT = 8000;

// ==============================
// ✅ Middleware
// ==============================
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// ==============================
// ✅ Core Routes
// ==============================
app.use("/api", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/cashier", cashierRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/walkin", walkinRoutes);

// ✅ IMPORTANT: Order matters! Auth routes first, then general member routes
app.use("/api/members", membersAuthRoutes); // Handles /api/members/login
app.use("/api/members", membersRoutes); // Handles /api/members/:id/audit and other member endpoints
app.use("/api/membership", membershipRoutes);
app.use("/api/authtrainers", authTrainersRoutes);
app.use("/api/audit-trail", auditTrailRoutes);

// ==============================
// 🏋️ Membership Plans & Benefits Routes
// ==============================

// GET - Fetch all membership plans with their benefits
app.get("/api/membership-plans", (req, res) => {
  const sql = `
    SELECT 
      membershipname,
      GROUP_CONCAT(membershipbenefits SEPARATOR ', ') as membershipbenefits
    FROM membership_plan
    GROUP BY membershipname
    ORDER BY membershipname ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching membership plans:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch membership plans",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} membership plans`);
    console.log('📊 Plans data:', results);
    res.json(results);
  });
});

// GET - Fetch specific member's plan and benefits by membership_type name
app.get("/api/members/:id/plan-benefits", (req, res) => {
  const { id } = req.params;
  
  console.log(`📥 Fetching plan benefits for member ID: ${id}`);
  
  // First, get the member to see their membership_type
  const memberSql = `SELECT * FROM members WHERE id = ?`;
  
  db.query(memberSql, [id], (err, memberResults) => {
    if (err) {
      console.error("❌ Error fetching member:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch member",
        details: err.message
      });
    }
    
    if (memberResults.length === 0) {
      console.error(`❌ Member with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        error: "Member not found"
      });
    }
    
    const member = memberResults[0];
    const membershipType = member.membership_type; // e.g., "Premium", "Basic", "VIP"
    
    console.log(`Member ${id} has membership_type: "${membershipType}"`);
    
    // Now fetch ALL plans and find the one that matches
    const plansSql = `SELECT * FROM membership_plan`;
    
    db.query(plansSql, (err, planResults) => {
      if (err) {
        console.error("❌ Error fetching plans:", err);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to fetch plans",
          details: err.message
        });
      }
      
      // Find matching plan by checking if membership_type matches plan id
      let matchedPlan = null;
      
      // Try to match by ID first (if membership_type is a number)
      if (!isNaN(membershipType)) {
        matchedPlan = planResults.find(p => p.id == membershipType);
      }
      
      // If no match found and we have plans, use the first plan as default
      if (!matchedPlan && planResults.length > 0) {
        console.warn(`⚠️ No plan found for membership_type "${membershipType}", using first available plan`);
        matchedPlan = planResults[0];
      }
      
      if (!matchedPlan) {
        return res.status(404).json({
          success: false,
          error: "No membership plan found"
        });
      }
      
      // Parse benefits
      let benefitsArray = [];
      if (matchedPlan.membershipbenefits) {
        try {
          // Try parsing as JSON
          benefitsArray = JSON.parse(matchedPlan.membershipbenefits);
        } catch (e) {
          // If not JSON, split by comma, newline, or pipe
          benefitsArray = matchedPlan.membershipbenefits
            .split(/[,\n|]/)
            .map(b => b.trim())
            .filter(b => b);
        }
      }
      
      const response = {
        id: member.id,
        member_name: member.member_name,
        membership_type: member.membership_type,
        membership_start: member.membership_start,
        membership_end: member.membership_end,
        status: member.status,
        plan_id: matchedPlan.id,
        plan_name: membershipType,
        benefits: benefitsArray
      };
      
      console.log(`✅ Fetched plan benefits for member ID ${id}:`, {
        membershipType: membershipType,
        planId: matchedPlan.id,
        benefitsCount: benefitsArray.length
      });
      
      res.json(response);
    });
  });
});

// Debug endpoint to check member and plan data
app.get("/api/debug/member-plan/:id", (req, res) => {
  const { id } = req.params;
  
  const queries = {
    member: `SELECT * FROM members WHERE id = ?`,
    plans: `SELECT * FROM membership_plan`
  };
  
  const results = {};
  
  db.query(queries.member, [id], (err, memberData) => {
    if (err) return res.status(500).json({ error: "Failed to fetch member" });
    results.member = memberData[0];
    
    db.query(queries.plans, (err, planData) => {
      if (err) return res.status(500).json({ error: "Failed to fetch plans" });
      results.plans = planData;
      
      res.json({
        success: true,
        data: results,
        explanation: {
          membershipType: results.member?.membership_type,
          membershipTypeIsNumber: !isNaN(results.member?.membership_type),
          matchingPlan: planData.find(p => p.id == results.member?.membership_type),
          allPlans: planData
        }
      });
    });
  });
});
// ==============================
// 👤 Admin Profile Routes
// ==============================

// GET - Fetch admin profile by contact number
app.get("/api/admin/profile/:contact", (req, res) => {
  const { contact } = req.params;

  console.log(`📥 Fetching admin profile for contact: ${contact}`);

  const sql = `
    SELECT 
      admin_id as id,
      name,
      email,
      contact,
      role,
      status,
      created_at
    FROM admin_table
    WHERE contact = ?
    LIMIT 1
  `;

  db.query(sql, [contact], (err, results) => {
    if (err) {
      console.error("❌ Error fetching admin profile:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        details: err.message
      });
    }

    if (results.length === 0) {
      console.warn(`⚠️ Admin not found for contact: ${contact}`);
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    console.log(`✅ Fetched profile for: ${results[0].name}`);
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// PUT - Update admin profile
app.put("/api/admin/profile/:contact", (req, res) => {
  const { contact } = req.params;
  const { name, email } = req.body;

  console.log(`🛠 Updating admin profile for contact: ${contact}`);

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required"
    });
  }

  const sql = `
    UPDATE admin_table 
    SET 
      name = ?,
      email = ?
    WHERE contact = ?
  `;

  db.query(sql, [name, email, contact], (err, result) => {
    if (err) {
      console.error("❌ Error updating admin profile:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    console.log(`✅ Admin profile updated for contact: ${contact}`);

    // Fetch and return the updated profile
    db.query(
      `SELECT 
        admin_id as id,
        name,
        email,
        contact,
        role,
        status,
        created_at
      FROM admin_table
      WHERE contact = ?`,
      [contact],
      (err, results) => {
        if (err) {
          return res.json({
            success: true,
            message: "Profile updated successfully"
          });
        }

        res.json({
          success: true,
          message: "Profile updated successfully",
          data: results[0]
        });
      }
    );
  });
});

// PUT - Update admin password
app.put("/api/admin/profile/:contact/password", (req, res) => {
  const { contact } = req.params;
  const { currentPassword, newPassword } = req.body;

  console.log(`🔐 Updating password for admin contact: ${contact}`);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long"
    });
  }

  // First, verify current password
  const verifySql = `
    SELECT password FROM admin_table WHERE contact = ?
  `;

  db.query(verifySql, [contact], (err, results) => {
    if (err) {
      console.error("❌ Error verifying password:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to verify password",
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found"
      });
    }

    // Compare passwords (NOT SECURE - use bcrypt in production!)
    if (results[0].password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    const updateSql = `
      UPDATE admin_table 
      SET password = ?
      WHERE contact = ?
    `;

    db.query(updateSql, [newPassword, contact], (err, result) => {
      if (err) {
        console.error("❌ Error updating password:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to change password",
          details: err.message
        });
      }

      console.log(`✅ Password updated for admin contact: ${contact}`);
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    });
  });
});

// ==============================
// 📦 Products Routes
// ==============================
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const { newQty } = req.body;
  if (!newQty && newQty !== 0) return res.status(400).json({ error: "newQty is required" });

  db.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [newQty, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update product" });
    db.query("SELECT * FROM products WHERE id = ?", [id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to fetch updated product" });
      res.json(rows[0]);
    });
  });
});

app.post("/api/products", (req, res) => {
  const { product_name, price, stock_quantity } = req.body;
  if (!product_name) return res.status(400).json({ error: "Product name is required" });

  db.query(
    "INSERT INTO products (product_name, price, stock_quantity) VALUES (?, ?, ?)",
    [product_name, price || 0, stock_quantity || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to add product" });
      db.query("SELECT * FROM products WHERE id = ?", [result.insertId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Failed to fetch added product" });
        res.status(201).json(rows[0]);
      });
    }
  );
});


// ==============================
// 💳 Transactions Routes
// ==============================

app.post("/api/transactions", (req, res) => {
  const { member_name, items } = req.body;

  console.log("📥 Received multi-item transaction:", { member_name, items });

  if (!member_name || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Member name and at least one item are required",
    });
  }

  const resultsArray = [];
  let completed = 0;
  let hasError = false;

  items.forEach((item) => {
    const { product, quantity, total_amount } = item;

    if (!product || quantity === undefined || total_amount === undefined) {
      hasError = true;
      return res.status(400).json({
        success: false,
        error: "Each item must have product, quantity, and total_amount",
      });
    }

    const insertQuery = `
      INSERT INTO transactions (member_name, product, quantity, total_amount, transaction_datetime)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const values = [member_name, product, quantity, total_amount];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("❌ SQL Error on transaction insert:", err);
        if (!hasError) {
          hasError = true;
          return res.status(500).json({
            success: false,
            error: "Failed to save one of the transactions",
            details: err.message,
          });
        }
        return;
      }

      const insertedId = result.insertId;
      const or_number = `OR-${String(insertedId).padStart(4, "0")}`;

      const updateQuery = `UPDATE transactions SET or_number = ? WHERE id = ?`;
      db.query(updateQuery, [or_number, insertedId], (updateErr) => {
        if (updateErr) {
          console.error("❌ Failed to update OR number:", updateErr);
          if (!hasError) {
            hasError = true;
            return res.status(500).json({
              success: false,
              error: "Failed to set OR number",
              details: updateErr.message,
            });
          }
          return;
        }

        resultsArray.push({
          id: insertedId,
          or_number,
          member_name,
          product,
          quantity,
          total_amount,
        });

        completed++;

        if (completed === items.length && !hasError) {
          console.log(`✅ ${completed} transactions saved with unique OR numbers.`);
          res.status(201).json({
            success: true,
            message: `${completed} transactions saved successfully`,
            transactions: resultsArray,
          });
        }
      });
    });
  });
});

// GET - Fetch all transactions
app.get("/api/transactions", (req, res) => {
  db.query("SHOW TABLES LIKE 'transactions'", (err, tableCheck) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Database connection error",
        details: err.message 
      });
    }

    if (tableCheck.length === 0) {
      console.error("❌ Table 'transactions' does not exist");
      return res.status(500).json({ 
        success: false, 
        error: "Transactions table does not exist. Please create it first.",
        details: "Run the SQL migration to create the transactions table" 
      });
    }

    const sql = `
      SELECT 
        id,
        or_number,
        member_name,
        product,
        quantity,
        total_amount,
        transaction_datetime
      FROM transactions
      ORDER BY transaction_datetime DESC, id DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Error fetching transactions:", err);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to fetch transactions",
          details: err.message
        });
      }
      
      console.log(`✅ Fetched ${results.length} transactions`);
      res.json(results);
    });
  });
});

// ==============================
// 👥 Staff Routes
// ==============================
app.post("/api/staff", (req, res) => {
  const { fullName, email, contactNumber, address, role, startDate, password } = req.body;

  console.log("📥 Creating new staff member:", { fullName, role, contactNumber });

  if (!fullName || !role || !password) {
    return res.status(400).json({
      success: false,
      error: "Name, role, and password are required"
    });
  }

  let insertQuery, values;

  if (role === 'trainer') {
    insertQuery = `
      INSERT INTO trainers_table (name, email, contact_number, password, status)
      VALUES (?, ?, ?, ?, 'Active')
    `;
    values = [fullName, email || null, contactNumber || null, password];
  } else if (role === 'cashier') {
    insertQuery = `
      INSERT INTO cashiers_login (name, email, phone, password, status, created_at)
      VALUES (?, ?, ?, ?, 'Active', NOW())
    `;
    values = [fullName, email || null, contactNumber || null, password];
  } else if (role === 'admin') {
    insertQuery = `
      INSERT INTO admin_table (name, email, contact, password, role, status, created_at)
      VALUES (?, ?, ?, ?, 'admin', 'Active', NOW())
    `;
    values = [fullName, email || null, contactNumber || null, password];
  } else {
    return res.status(400).json({
      success: false,
      error: "Invalid role. Must be trainer, cashier, or admin"
    });
  }

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error(`❌ Error creating ${role}:`, err);
      return res.status(500).json({
        success: false,
        error: `Failed to create ${role} account`,
        details: err.message
      });
    }

    console.log(`✅ ${role} account created with ID: ${result.insertId}`);

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      data: {
        id: result.insertId,
        name: fullName,
        role: role,
        contact_number: contactNumber,
        email: email || null,
        status: 'Active'
      }
    });
  });
});

app.get("/api/staff/all", (req, res) => {
  const queries = [
    `SELECT 
      id,
      name,
      email,
      contact_number,
      'trainer' as role,
      '********' as password,
      status,
      NULL as created_at
    FROM trainers_table`,
    `SELECT 
      id,
      name,
      email,
      phone as contact_number,
      'cashier' as role,
      '********' as password,
      status,
      created_at
    FROM cashiers_login`,
    `SELECT 
      admin_id as id,
      name,
      email,
      contact as contact_number,
      'admin' as role,
      '********' as password,
      status,
      created_at
    FROM admin_table`
  ];

  const combinedQuery = queries.join(' UNION ALL ') + ' ORDER BY COALESCE(created_at, "0000-00-00") DESC, id DESC';

  db.query(combinedQuery, (err, results) => {
    if (err) {
      console.error("❌ Error fetching all staff:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch staff members",
        details: err.message
      });
    }

    console.log(`✅ Fetched ${results.length} total staff members`);
    console.log('📊 Raw data from database:', JSON.stringify(results, null, 2));
    res.json(results);
  });
});

// ✅ PATCH - Update staff status (trainer, cashier, admin)
app.patch("/api/staff/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;

  console.log(`🛠 Updating status for ${role} ID ${id} → ${status}`);

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Invalid status value. Must be 'active' or 'inactive'."
    });
  }

  let table, idColumn;

  switch (role) {
    case "trainer":
      table = "trainers_table";
      idColumn = "id";
      break;
    case "cashier":
      table = "cashiers_login";
      idColumn = "id";
      break;
    case "admin":
      table = "admin_table";
      idColumn = "admin_id";
      break;
    default:
      return res.status(400).json({
        success: false,
        error: "Invalid role provided."
      });
  }

  const query = `UPDATE ${table} SET status = ? WHERE ${idColumn} = ?`;
  db.query(query, [status.charAt(0).toUpperCase() + status.slice(1), id], (err, result) => {
    if (err) {
      console.error("❌ Error updating staff status:", err);
      return res.status(500).json({
        success: false,
        error: "Database update failed.",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: `${role} with ID ${id} not found`
      });
    }

    console.log(`✅ ${role} ID ${id} status updated to ${status}`);
    res.json({
      success: true,
      message: `${role} status updated successfully.`,
      updatedStatus: status
    });
  });
});

// ==============================
// 👨‍🏫 Trainers Extended Routes
// ==============================

// GET - Fetch all trainers (including inactive) with specialization
// GET - Fetch all trainers (including inactive) - FIXED
app.get("/api/trainers/all", (req, res) => {
  const sql = `
    SELECT 
      id as trainer_id,
      name as trainer_name,
      email,
      contact_number,
      session_type as specialization,
      status
    FROM trainers_table
    ORDER BY name ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching all trainers:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch trainers",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} trainers`);
    res.json(results);
  });
});

// GET - Fetch active trainers only - FIXED
app.get("/api/trainers", (req, res) => {
  const sql = `
    SELECT 
      id as trainer_id,
      name as trainer_name,
      email,
      contact_number,
      session_type as specialization,
      status
    FROM trainers_table
    WHERE status = 'Active'
    ORDER BY name ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching trainers:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch trainers",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} active trainers`);
    res.json(results);
  });
});

// PUT - Update trainer specialization - FIXED
app.put("/api/trainers/:id/specialization", (req, res) => {
  const { id } = req.params;
  const { specialization } = req.body;
  
  console.log(`🛠 Updating session_type for trainer ID ${id} → ${specialization}`);
  
  const sql = `UPDATE trainers_table SET session_type = ? WHERE id = ?`;
  
  db.query(sql, [specialization || null, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating session_type:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update specialization",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Trainer not found"
      });
    }
    
    console.log(`✅ Trainer ID ${id} session_type updated to: ${specialization}`);
    res.json({
      success: true,
      message: "Specialization updated successfully"
    });
  });
});

// GET - Fetch active trainers only
app.get("/api/trainers", (req, res) => {
  const sql = `
    SELECT 
      id as trainer_id,
      name as trainer_name,
      email,
      contact_number,
      specialization,
      status
    FROM trainers_table
    WHERE status = 'Active'
    ORDER BY name ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching trainers:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch trainers",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} active trainers`);
    res.json(results);
  });
});

// PUT - Update trainer specialization
app.put("/api/trainers/:id/specialization", (req, res) => {
  const { id } = req.params;
  const { specialization } = req.body;
  
  console.log(`🛠 Updating specialization for trainer ID ${id} → ${specialization}`);
  
  const sql = `UPDATE trainers_table SET specialization = ? WHERE id = ?`;
  
  db.query(sql, [specialization || null, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating specialization:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update specialization",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Trainer not found"
      });
    }
    
    console.log(`✅ Trainer ID ${id} specialization updated to: ${specialization}`);
    res.json({
      success: true,
      message: "Specialization updated successfully"
    });
  });
});

// ==============================
// 📅 Sessions Routes (UPDATED WITH TRAINER_ID)
// ==============================

// GET - Fetch all sessions (OLD - for backward compatibility)
app.get("/api/sessions", (req, res) => {
  const sql = `
    SELECT 
      session_id,
      trainer_name,
      client_name,
      client_contact,
      client_email,
      session_type,
      session_date,
      session_timein,
      session_timeout,
      status,
      notes,
      created_at
    FROM sessions_table
    ORDER BY session_date DESC, session_timein DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching sessions:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch sessions",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} sessions`);
    res.json(results);
  });
});

// GET - Fetch all sessions with trainer info (NEW)
// GET - Fetch all sessions with trainer info (FIXED)
app.get("/api/sessions/all", (req, res) => {
  const sql = `
    SELECT 
      s.session_id,
      s.trainer_name,
      s.client_name,
      s.client_contact,
      s.client_email,
      s.session_type,
      s.session_date,
      s.session_timein,
      s.session_timeout,
      s.status,
      s.notes,
      s.created_at
    FROM sessions_table s
    ORDER BY s.session_date DESC, s.session_timein DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching sessions:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch sessions",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} sessions`);
    res.json(results);
  });
});
// GET - Fetch single session by ID
app.get("/api/sessions/:id", (req, res) => {
  const { id } = req.params;
  
  db.query("SELECT * FROM sessions_table WHERE session_id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching session:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch session",
        details: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }
    
    console.log(`✅ Fetched session ID: ${id}`);
    res.json(results[0]);
  });
});

// PUT - Update session (OLD - for backward compatibility)
app.put("/api/sessions/:id", (req, res) => {
  const { id } = req.params;
  const { trainer_name, status, notes } = req.body;
  
  console.log(`🛠 Updating session ID ${id}:`, { trainer_name, status, notes });
  
  let updates = [];
  let values = [];
  
  if (trainer_name !== undefined) {
    updates.push("trainer_name = ?");
    values.push(trainer_name);
  }
  
  if (status !== undefined) {
    updates.push("status = ?");
    values.push(status);
  }
  
  if (notes !== undefined) {
    updates.push("notes = ?");
    values.push(notes);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: "No fields to update"
    });
  }
  
  values.push(id);
  const sql = `UPDATE sessions_table SET ${updates.join(", ")} WHERE session_id = ?`;
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error updating session:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update session",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }
    
    console.log(`✅ Session ID ${id} updated successfully`);
    
    // Fetch and return the updated session
    db.query("SELECT * FROM sessions_table WHERE session_id = ?", [id], (err, results) => {
      if (err) {
        return res.json({
          success: true,
          message: "Session updated successfully"
        });
      }
      
      res.json({
        success: true,
        message: "Session updated successfully",
        data: results[0]
      });
    });
  });
});

// PUT - Assign trainer to session (NEW)
app.put("/api/sessions/:id/assign", (req, res) => {
  const { id } = req.params;
  const { trainer_id } = req.body;
  
  console.log(`🛠 Assigning trainer ${trainer_id} to session ${id}`);
  
  const sql = `UPDATE sessions_table SET trainer_id = ?, status = 'confirmed' WHERE session_id = ?`;
  
  db.query(sql, [trainer_id, id], (err, result) => {
    if (err) {
      console.error("❌ Error assigning trainer:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to assign trainer",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }
    
    console.log(`✅ Trainer ${trainer_id} assigned to session ${id}`);
    res.json({
      success: true,
      message: "Trainer assigned successfully"
    });
  });
});

// PUT - Cancel session (NEW)
app.put("/api/sessions/:id/cancel", (req, res) => {
  const { id } = req.params;
  
  console.log(`🚫 Cancelling session ${id}`);
  
  const sql = `UPDATE sessions_table SET status = 'cancelled' WHERE session_id = ?`;
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error cancelling session:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to cancel session",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }
    
    console.log(`✅ Session ${id} cancelled`);
    res.json({
      success: true,
      message: "Session cancelled successfully"
    });
  });
});

// POST - Create new session
app.post("/api/sessions", (req, res) => {
  const { 
    trainer_name, 
    client_name, 
    client_contact, 
    client_email, 
    session_type, 
    session_date, 
    session_timein,
    session_timeout,
    notes 
  } = req.body;
  
  console.log("📥 Creating new session:", { 
    client_name, 
    session_date, 
    session_timein, 
    session_timeout 
  });
  
  if (!client_name || !session_date || !session_timein) {
    return res.status(400).json({
      success: false,
      error: "Client name, session date, and session time are required"
    });
  }
  
  const sql = `
    INSERT INTO sessions_table 
    (trainer_name, client_name, client_contact, client_email, session_type, session_date, session_timein, session_timeout, status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
  `;
  
  const values = [
    trainer_name || "",
    client_name,
    client_contact || "",
    client_email || "",
    session_type || "",
    session_date,
    session_timein,
    session_timeout || null,
    notes || null
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error creating session:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to create session",
        details: err.message
      });
    }
    
    console.log(`✅ Session created with ID: ${result.insertId}`);
    
    // Fetch and return the created session
    db.query("SELECT * FROM sessions_table WHERE session_id = ?", [result.insertId], (err, results) => {
      if (err) {
        return res.status(201).json({
          success: true,
          message: "Session created successfully",
          session_id: result.insertId
        });
      }
      
      res.status(201).json({
        success: true,
        message: "Session created successfully",
        data: results[0]
      });
    });
  });
});

// DELETE - Delete session
app.delete("/api/sessions/:id", (req, res) => {
  const { id } = req.params;
  
  console.log(`🗑️ Deleting session ID: ${id}`);
  
  db.query("DELETE FROM sessions_table WHERE session_id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting session:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to delete session",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }
    
    console.log(`✅ Session ID ${id} deleted successfully`);
    res.json({
      success: true,
      message: "Session deleted successfully"
    });
  });
});
// ==============================
// 📚 Classes Routes (classes_table)
// ==============================

// GET - Fetch all classes
// POST - Create new class using id column for member reference
app.post("/api/classes", (req, res) => {
  const { 
    classes_type,
    classes_date,
    classes_timein,
    classes_timout,
    id  // This is the member's id from members table
  } = req.body;
  
  console.log("📥 Creating new class:", { 
    classes_type, 
    classes_date, 
    classes_timein,
    member_id: id
  });
  
  if (!classes_type || !classes_date || !classes_timein || !id) {
    return res.status(400).json({
      success: false,
      error: "Class type, date, time, and member id are required"
    });
  }
  
  const sql = `
    INSERT INTO classes_table 
    (id, classes_type, classes_date, classes_timein, classes_timout, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;
  
  const values = [
    id,  // member's id
    classes_type,
    classes_date,
    classes_timein,
    classes_timout || null
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error creating class:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to create class",
        details: err.message
      });
    }
    
    console.log(`✅ Class created with ID: ${result.insertId} for member id: ${id}`);
    
    res.status(201).json({
      success: true,
      message: "Class created successfully",
      classes_id: result.insertId,
      member_id: id
    });
  });
});
// Add these endpoints to your server.js (after your existing routes, before the 404 handler)

// ==============================
// 👥 Members Routes
// ==============================
app.get("/api/members", (req, res) => {
  const sql = `
    SELECT 
      id,
      member_name,
      contact_number,
      email,
      membership_type,
      membership_start,
      membership_end,
      status,
      rfid
    FROM members
    ORDER BY member_name ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching members:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch members",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} members`);
    res.json(results);
  });
});

// GET - Fetch member stats
app.get("/api/members/stats", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as totalMembers,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeMembers,
      SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactiveMembers
    FROM members
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching member stats:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch member stats",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched member stats`);
    res.json(results[0]);
  });
});

// ==============================
// 📅 Attendance Routes
// ==============================
app.get("/api/attendance", (req, res) => {
  const sql = `
    SELECT 
      id,
      member_name,
      check_in_time,
      check_out_time,
      status
    FROM attendance
    WHERE DATE(check_in_time) = CURDATE()
    ORDER BY check_in_time DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching attendance:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch attendance",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} attendance records`);
    res.json(results);
  });
});

// GET - Fetch today's attendance (current present count)
app.get("/api/attendance/today", (req, res) => {
  const sql = `
    SELECT COUNT(*) as currentPresent
    FROM attendance
    WHERE DATE(check_in_time) = CURDATE()
    AND check_out_time IS NULL
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching today's attendance:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch attendance count",
        details: err.message
      });
    }
    
    console.log(`✅ Current gym capacity: ${results[0].currentPresent}`);
    res.json({
      currentPresent: results[0].currentPresent || 0
    });
  });
});

// GET - Fetch gym capacity
app.get("/api/attendance/capacity", (req, res) => {
  // You can set this in your database or hardcode it
  // For now, returning a default value
  const maxCapacity = 50; // Change this to your gym's max capacity
  
  res.json({
    maxCapacity: maxCapacity
  });
});

// POST - Check in member
app.post("/api/attendance/checkin", (req, res) => {
  const { member_name, rfid } = req.body;
  
  if (!member_name || !rfid) {
    return res.status(400).json({
      success: false,
      error: "Member name and RFID are required"
    });
  }
  
  const sql = `
    INSERT INTO attendance (member_name, rfid, check_in_time, status)
    VALUES (?, ?, NOW(), 'checked_in')
  `;
  
  db.query(sql, [member_name, rfid], (err, result) => {
    if (err) {
      console.error("❌ Error checking in member:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to check in member",
        details: err.message
      });
    }
    
    console.log(`✅ Member ${member_name} checked in`);
    res.status(201).json({
      success: true,
      message: "Member checked in successfully",
      attendance_id: result.insertId
    });
  });
});

// PUT - Check out member
app.put("/api/attendance/:id/checkout", (req, res) => {
  const { id } = req.params;
  
  const sql = `
    UPDATE attendance 
    SET check_out_time = NOW(), status = 'checked_out' 
    WHERE id = ?
  `;
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error checking out member:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to check out member",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Attendance record not found"
      });
    }
    
    console.log(`✅ Member checked out`);
    res.json({
      success: true,
      message: "Member checked out successfully"
    });
  });
});

// ==============================
// 📝 Audit Trail Route
// ==============================
app.post("/api/audit-trail", (req, res) => {
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
    res.json({
      success: true,
      message: "Audit trail logged",
      audit_id: result.insertId
    });
  });
});
// Add these routes to your backend server.js file

// ==============================
// 👤 Cashier Profile Routes
// ==============================

// GET - Fetch cashier profile by phone number
app.get("/api/cashier/profile/:phone", (req, res) => {
  const { phone } = req.params;

  console.log(`📥 Fetching cashier profile for phone: ${phone}`);

  const sql = `
    SELECT 
      id,
      name,
      email,
      phone,
      status,
      created_at
    FROM cashiers_login
    WHERE phone = ?
    LIMIT 1
  `;

  db.query(sql, [phone], (err, results) => {
    if (err) {
      console.error("❌ Error fetching cashier profile:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cashier not found"
      });
    }

    console.log(`✅ Fetched profile for: ${results[0].name}`);
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// PUT - Update cashier profile
app.put("/api/cashier/profile/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  console.log(`🛠 Updating cashier profile ID ${id}`);

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and phone are required"
    });
  }

  const sql = `
    UPDATE cashiers_login 
    SET name = ?, email = ?, phone = ?
    WHERE id = ?
  `;

  db.query(sql, [name, email, phone, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating profile:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cashier not found"
      });
    }

    console.log(`✅ Cashier ID ${id} profile updated`);
    res.json({
      success: true,
      message: "Profile updated successfully"
    });
  });
});

// PUT - Update cashier password
app.put("/api/cashier/profile/:id/password", (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  console.log(`🔐 Updating password for cashier ID ${id}`);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long"
    });
  }

  // First, verify current password
  const verifySql = `
    SELECT password FROM cashiers_login WHERE id = ?
  `;

  db.query(verifySql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error verifying password:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to verify password",
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cashier not found"
      });
    }

    // In production, use bcrypt to compare hashed passwords
    // For now, we're comparing plain text (NOT SECURE - use bcrypt in production!)
    if (results[0].password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    const updateSql = `
      UPDATE cashiers_login 
      SET password = ?
      WHERE id = ?
    `;

    db.query(updateSql, [newPassword, id], (err, result) => {
      if (err) {
        console.error("❌ Error updating password:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to change password",
          details: err.message
        });
      }

      console.log(`✅ Password updated for cashier ID ${id}`);
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    });
  });
});
// GET - Fetch all classes with member information using JOIN
app.get("/api/classes", (req, res) => {
  const sql = `
    SELECT 
      c.classes_id,
      c.id,
      c.classes_type,
      c.classes_date,
      c.classes_timein,
      c.classes_timout,
      c.status,
      m.member_name,
      m.contact_number,
      m.email
    FROM classes_table c
    LEFT JOIN members m ON c.id = m.id
    ORDER BY c.classes_date DESC, c.classes_timein DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching classes:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch classes",
        details: err.message
      });
    }
    
    console.log(`✅ Fetched ${results.length} classes`);
    res.json(results);
  });
});
// ==============================
// 👤 Member Membership Management
// ==============================

// PUT - Update member status (for cashier route)
app.put("/api/cashier/members/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`🔄 Updating member ${id} status to: ${status}`);
  
  const sql = `UPDATE members SET status = ? WHERE id = ?`;
  
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating member status:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update status",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Member not found"
      });
    }
    
    console.log(`✅ Member ${id} status updated to: ${status}`);
    res.json({
      success: true,
      message: "Status updated successfully"
    });
  });
});

app.post("/api/members/membership/cancel", (req, res) => {
  const { id } = req.body;
  
  console.log(`🚫 Cancelling membership for member ID: ${id}`);
  
  // Update status to 'inactive' and remove RFID
  db.query(
    "UPDATE members SET status = 'inactive', rfid = NULL WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("❌ Error cancelling membership:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to cancel membership",
          details: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Member not found"
        });
      }
      
      console.log(`✅ Membership cancelled for member ID ${id}. RFID removed and status set to inactive.`);
      res.json({ 
        success: true, 
        message: "Membership cancelled successfully. RFID access has been removed." 
      });
    }
  );
});
// ==============================
// 👤 Member Profile Routes
// ==============================

// PUT - Update member profile (name, email, contact_number)
app.put("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const { member_name, email, contact_number } = req.body;

  console.log(`🛠 Updating member profile ID ${id}:`, { member_name, email, contact_number });

  // Validation
  if (!member_name || !email || !contact_number) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and contact number are required"
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  // Validate phone number (at least 10 digits)
  const phoneDigits = contact_number.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Phone number must have at least 10 digits"
    });
  }

  // Check if email or contact number already exists for another member
  const checkSql = `
    SELECT id FROM members 
    WHERE (email = ? OR contact_number = ?) 
    AND id != ?
  `;

  db.query(checkSql, [email, contact_number, id], (err, checkResults) => {
    if (err) {
      console.error("❌ Error checking duplicate email/contact:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
        details: err.message
      });
    }

    if (checkResults.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or contact number already exists for another member"
      });
    }

    // Update member profile
    const updateSql = `
      UPDATE members 
      SET 
        member_name = ?,
        email = ?,
        contact_number = ?
      WHERE id = ?
    `;

    db.query(updateSql, [member_name, email, contact_number, id], (err, result) => {
      if (err) {
        console.error("❌ Error updating member profile:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update profile",
          details: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Member not found"
        });
      }

      console.log(`✅ Member ID ${id} profile updated successfully`);

      // Fetch and return updated member data
      db.query(
        `SELECT 
          id,
          member_name,
          email,
          contact_number,
          membership_type,
          membership_start,
          membership_end,
          status
        FROM members WHERE id = ?`,
        [id],
        (err, results) => {
          if (err) {
            return res.json({
              success: true,
              message: "Profile updated successfully"
            });
          }

          res.json({
            success: true,
            message: "Profile updated successfully",
            data: results[0]
          });
        }
      );
    });
  });
});

// PUT - Update member password
app.put("/api/members/:id/password", (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  console.log(`🔐 Updating password for member ID ${id}`);

  // Validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long"
    });
  }

  // First, verify current password
  const verifySql = `SELECT password FROM members WHERE id = ?`;

  db.query(verifySql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error verifying password:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to verify password",
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    // Compare passwords (NOTE: In production, use bcrypt!)
    if (results[0].password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    const updateSql = `UPDATE members SET password = ? WHERE id = ?`;

    db.query(updateSql, [newPassword, id], (err, result) => {
      if (err) {
        console.error("❌ Error updating password:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update password",
          details: err.message
        });
      }

      console.log(`✅ Password updated for member ID ${id}`);
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    });
  });
});
// ==============================
// 👨‍🏫 Trainer Dashboard Routes
// ==============================

// GET - Fetch trainer dashboard data (total clients and this week's bookings)
app.get("/api/trainer/dashboard/:trainerId", (req, res) => {
  const { trainerId } = req.params;

  console.log(`📊 Fetching dashboard data for trainer ID: ${trainerId}`);

  // Get current week's start date (Sunday)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // Get week's end date (Saturday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Query 1: Count total unique clients for this trainer
  const clientsQuery = `
    SELECT COUNT(DISTINCT client_name) as totalClients
    FROM sessions_table
    WHERE trainer_name = (
      SELECT name FROM trainers_table WHERE id = ?
    )
  `;

  // Query 2: Count this week's bookings
  const bookingsQuery = `
    SELECT COUNT(*) as thisWeekBookings
    FROM sessions_table
    WHERE trainer_name = (
      SELECT name FROM trainers_table WHERE id = ?
    )
    AND DATE(session_date) >= DATE(?)
    AND DATE(session_date) <= DATE(?)
  `;

  // Query 3: Get next upcoming session
  const nextSessionQuery = `
    SELECT 
      session_id,
      client_name,
      session_type,
      session_date,
      session_timein,
      status
    FROM sessions_table
    WHERE trainer_name = (
      SELECT name FROM trainers_table WHERE id = ?
    )
    AND session_date >= NOW()
    ORDER BY session_date ASC, session_timein ASC
    LIMIT 1
  `;

  // Query 4: Get all sessions for this week
  const weekSessionsQuery = `
    SELECT 
      session_id,
      client_name,
      session_type,
      session_date,
      session_timein,
      status
    FROM sessions_table
    WHERE trainer_name = (
      SELECT name FROM trainers_table WHERE id = ?
    )
    AND DATE(session_date) >= DATE(?)
    AND DATE(session_date) <= DATE(?)
    ORDER BY session_date ASC, session_timein ASC
  `;

  let dashboardData = {};

  // Execute all queries
  db.query(clientsQuery, [trainerId], (err, clientResults) => {
    if (err) {
      console.error("❌ Error fetching total clients:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch client count",
        details: err.message
      });
    }

    dashboardData.totalClients = clientResults[0]?.totalClients || 0;

    db.query(bookingsQuery, [trainerId, weekStart, weekEnd], (err, bookingResults) => {
      if (err) {
        console.error("❌ Error fetching this week's bookings:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch bookings count",
          details: err.message
        });
      }

      dashboardData.thisWeekBookings = bookingResults[0]?.thisWeekBookings || 0;

      db.query(nextSessionQuery, [trainerId], (err, nextSessionResults) => {
        if (err) {
          console.error("❌ Error fetching next session:", err);
          return res.status(500).json({
            success: false,
            error: "Failed to fetch next session",
            details: err.message
          });
        }

        dashboardData.nextSession = nextSessionResults[0] || null;

        db.query(weekSessionsQuery, [trainerId, weekStart, weekEnd], (err, weekSessionsResults) => {
          if (err) {
            console.error("❌ Error fetching week sessions:", err);
            return res.status(500).json({
              success: false,
              error: "Failed to fetch week sessions",
              details: err.message
            });
          }

          dashboardData.weekSessions = weekSessionsResults || [];

          console.log(`✅ Dashboard data fetched for trainer ${trainerId}:`, {
            totalClients: dashboardData.totalClients,
            thisWeekBookings: dashboardData.thisWeekBookings,
            sessionsCount: dashboardData.weekSessions.length
          });

          res.json({
            success: true,
            data: dashboardData
          });
        });
      });
    });
  });
});

// GET - Fetch trainer's personal sessions for the week
app.get("/api/trainer/:trainerId/personal-sessions", (req, res) => {
  const { trainerId } = req.params;

  console.log(`📅 Fetching personal sessions for trainer ID: ${trainerId}`);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const sql = `
    SELECT 
      session_id,
      client_name,
      session_type,
      session_date,
      session_timein,
      session_timeout,
      status,
      notes
    FROM sessions_table
    WHERE trainer_name = (
      SELECT name FROM trainers_table WHERE id = ?
    )
    AND DATE(session_date) >= DATE(?)
    AND DATE(session_date) <= DATE(?)
    AND session_type = 'personal'
    ORDER BY session_date ASC, session_timein ASC
  `;

  db.query(sql, [trainerId, weekStart, weekEnd], (err, results) => {
    if (err) {
      console.error("❌ Error fetching personal sessions:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch personal sessions",
        details: err.message
      });
    }

    console.log(`✅ Fetched ${results.length} personal sessions for trainer ${trainerId}`);
    res.json({
      success: true,
      data: results
    });
  });
});

// GET - Fetch trainer's class sessions for the week
app.get("/api/trainer/:trainerId/class-sessions", (req, res) => {
  const { trainerId } = req.params;

  console.log(`📅 Fetching class sessions for trainer ID: ${trainerId}`);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const sql = `
    SELECT 
      session_id,
      client_name,
      session_type,
      session_date,
      session_timein,
      session_timeout,
      status,
      notes,
      COUNT(DISTINCT client_name) as totalClients
    FROM sessions_table
    WHERE trainer_name = (
      SELECT name FROM trainers_table WHERE id = ?
    )
    AND DATE(session_date) >= DATE(?)
    AND DATE(session_date) <= DATE(?)
    AND session_type = 'class'
    GROUP BY DATE(session_date), session_timein
    ORDER BY session_date ASC, session_timein ASC
  `;

  db.query(sql, [trainerId, weekStart, weekEnd], (err, results) => {
    if (err) {
      console.error("❌ Error fetching class sessions:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch class sessions",
        details: err.message
      });
    }

    console.log(`✅ Fetched ${results.length} class sessions for trainer ${trainerId}`);
    res.json({
      success: true,
      data: results
    });
  });
});
// PUT - Update trainer password (ADD THIS TO YOUR SERVER.JS)
app.put("/api/trainers/:id/password", (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  console.log(`🔐 Updating password for trainer ID: ${id}`);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long"
    });
  }

  // First, verify current password
  const verifySql = `SELECT password FROM trainers_table WHERE id = ?`;

  db.query(verifySql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error verifying password:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to verify password",
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found"
      });
    }

    // Compare current password with stored password
    if (results[0].password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    const updateSql = `UPDATE trainers_table SET password = ? WHERE id = ?`;

    db.query(updateSql, [newPassword, id], (err, result) => {
      if (err) {
        console.error("❌ Error updating password:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to change password",
          details: err.message
        });
      }

      console.log(`✅ Password updated for trainer ID: ${id}`);
      res.json({
        success: true,
        message: "Password changed successfully"
      });
    });
  });
});

// PUT - Update trainer profile (name, email)
app.put("/api/trainers/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  console.log(`🛠 Updating trainer profile ID ${id}`);

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and email are required"
    });
  }

  const sql = `
    UPDATE trainers_table 
    SET name = ?, email = ?
    WHERE id = ?
  `;

  db.query(sql, [name, email, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating trainer profile:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found"
      });
    }

    console.log(`✅ Trainer ID ${id} profile updated`);
    res.json({
      success: true,
      message: "Profile updated successfully"
    });
  });
});
// PUT - Update class status
app.put("/api/classes/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`🛠 Updating class ID ${id} status to: ${status}`);
  
  if (!status) {
    return res.status(400).json({
      success: false,
      error: "Status is required"
    });
  }
  
  const sql = `UPDATE classes_table SET status = ? WHERE classes_id = ?`;
  
  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating class:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update class",
        details: err.message
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Class not found"
      });
    }
    
    console.log(`✅ Class ID ${id} status updated to: ${status}`);
    
    // Fetch and return the updated class
    db.query("SELECT * FROM classes_table WHERE classes_id = ?", [id], (err, results) => {
      if (err) {
        return res.json({
          success: true,
          message: "Class updated successfully"
        });
      }
      
      res.json({
        success: true,
        message: "Class updated successfully",
        data: results[0]
      });
    });
  });
});

// ==============================
// 👤 Member Membership Management
// ==============================
app.post("/api/members/membership/cancel", (req, res) => {
  const { id } = req.body;
  
  console.log(`🚫 Cancelling membership for member ID: ${id}`);
  
  // Update status to 'inactive' and remove RFID
  db.query(
    "UPDATE members SET status = 'inactive', rfid = NULL WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("❌ Error cancelling membership:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to cancel membership",
          details: err.message
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Member not found"
        });
      }
      
      console.log(`✅ Membership cancelled for member ID ${id}. RFID removed and status set to inactive.`);
      res.json({ 
        success: true, 
        message: "Membership cancelled successfully. RFID access has been removed." 
      });
    }
  );
});

// ==============================
// ✅ Test / Root
// ==============================
app.get("/", (req, res) => {
  res.json({
    message: "🏋️ MEL-Gym API Server is running!",
    version: "1.0.0",
    endpoints: {
      login: "POST /api/login",
      products: "GET /api/products",
      updateProduct: "PUT /api/products/:id",
      addProduct: "POST /api/products",
      attendance: "GET /api/attendance",
      walkin: "GET /api/walkin",
      createTransaction: "POST /api/transactions",
      getTransactions: "GET /api/transactions",
      createStaff: "POST /api/staff",
      getAllStaff: "GET /api/staff/all",
      updateStaffStatus: "PATCH /api/staff/:id/status",
      members: "GET /api/members",
      membersStats: "GET /api/members/stats",
      memberAudit: "GET /api/members/:id/audit",
      membershipPlans: "GET /api/membership-plans",
      cancelMembership: "POST /api/members/membership/cancel",
      sessions: "GET /api/sessions",
      sessionsAll: "GET /api/sessions/all",
      getSession: "GET /api/sessions/:id",
      createSession: "POST /api/sessions",
      updateSession: "PUT /api/sessions/:id",
      assignTrainer: "PUT /api/sessions/:id/assign",
      cancelSession: "PUT /api/sessions/:id/cancel",
      deleteSession: "DELETE /api/sessions/:id",
      trainers: "GET /api/trainers",
      trainersAll: "GET /api/trainers/all",
      updateSpecialization: "PUT /api/trainers/:id/specialization"
    }
  });
});

app.get("/api/test-db", (req, res) => {
  db.query("SELECT COUNT(*) as userCount FROM users", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database connection failed", error: err.message });
    res.json({ success: true, message: "Database connected successfully", userCount: results[0].userCount });
  });
});

// ==============================
// ⚠️ 404 + Error Handlers
// ==============================
app.use((req, res) => res.status(404).json({ success: false, message: "Endpoint not found" }));
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
});

// ==============================
// 🚀 Start Server
// ==============================
app.listen(PORT, () => console.log(`✅ MEL-Gym API running at: http://localhost:${PORT}`));