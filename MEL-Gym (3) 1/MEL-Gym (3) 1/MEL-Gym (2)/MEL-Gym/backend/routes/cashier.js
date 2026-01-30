import express from "express";
import { db } from "../db.js";

const router = express.Router();

// ✅ GET all members
router.get("/members", (req, res) => {
  const query = "SELECT * FROM members ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching members:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch members",
        details: err.message,
      });
    }
    res.json(results);
  });
});

// ✅ POST new member (RFID optional, must be unique across members and walk_in)
router.post("/members", (req, res) => {
  const {
    rfid,
    member_name,
    contact_number,
    email,
    address,
    password,
    membership_type,
    membership_start,
    membership_end,
    membership_time,
    status,
  } = req.body;

  if (!member_name || !contact_number || !membership_type) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: member_name, contact_number, or membership_type",
    });
  }

  const trimmedRFID = rfid?.trim() || "";

  function insertMember() {
    const insertQuery = `
      INSERT INTO members 
      (rfid, member_name, contact_number, email, address, password, membership_type, membership_start, membership_end, membership_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      trimmedRFID,
      member_name.trim(),
      contact_number.trim(),
      email?.trim() || null,
      address?.trim() || null,
      password?.trim() || null,
      membership_type,
      membership_start || new Date(),
      membership_end || null,
      membership_time || null,
      status || "inactive",
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("❌ Error adding member:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to add member to database",
          details: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Member added successfully",
        id: result.insertId,
      });
    });
  }

  if (trimmedRFID) {
    db.query("SELECT rfid FROM members WHERE rfid = ?", [trimmedRFID], (errMembers, resultsMembers) => {
      if (errMembers) return res.status(500).json({ success: false, error: errMembers.message });
      if (resultsMembers.length > 0)
        return res.status(400).json({ success: false, error: "RFID already exists in members table" });

      db.query("SELECT RFID_number FROM walk_in WHERE RFID_number = ?", [trimmedRFID], (errWalk, resultsWalk) => {
        if (errWalk) return res.status(500).json({ success: false, error: errWalk.message });
        if (resultsWalk.length > 0)
          return res.status(400).json({ 
            success: false, 
            error: "RFID already exists in walk_in table",
            note: "This RFID is already assigned to a walk-in customer" 
          });

        insertMember();
      });
    });
  } else {
    insertMember();
  }
});

// ✅ PUT update RFID after payment (check walk_in table too)
router.put("/members/:id/rfid", (req, res) => {
  const { id } = req.params;
  const { rfid } = req.body;

  if (!rfid?.trim()) {
    return res.status(400).json({ success: false, error: "RFID cannot be empty" });
  }

  const trimmedRFID = rfid.trim();

  db.query("SELECT rfid FROM members WHERE rfid = ? AND id != ?", [trimmedRFID, id], (errMembers, resultsMembers) => {
    if (errMembers) return res.status(500).json({ success: false, error: errMembers.message });
    if (resultsMembers.length > 0)
      return res.status(400).json({ success: false, error: "RFID already exists in members table" });

    db.query("SELECT RFID_number FROM walk_in WHERE RFID_number = ?", [trimmedRFID], (errWalk, resultsWalk) => {
      if (errWalk) return res.status(500).json({ success: false, error: errWalk.message });
      if (resultsWalk.length > 0)
        return res.status(400).json({ 
          success: false, 
          error: "RFID already exists in walk_in table",
          note: "This RFID is already assigned to a walk-in customer" 
        });

      db.query("UPDATE members SET rfid = ? WHERE id = ?", [trimmedRFID, id], (errUpdate, result) => {
        if (errUpdate) return res.status(500).json({ success: false, error: errUpdate.message });
        if (result.affectedRows === 0)
          return res.status(404).json({ success: false, error: "Member not found" });

        res.json({ success: true, message: "RFID updated successfully" });
      });
    });
  });
});

// ✅ PUT update member's membership type and end date
router.put("/members/:id/membership", (req, res) => {
  const { id } = req.params;
  const { membership_type, membership_end } = req.body;

  if (!membership_type && !membership_end) {
    return res.status(400).json({
      success: false,
      error: "At least membership_type or membership_end is required"
    });
  }

  let updates = [];
  let values = [];

  if (membership_type) {
    updates.push("membership_type = ?");
    values.push(membership_type);
  }

  if (membership_end) {
    updates.push("membership_end = ?");
    values.push(membership_end);
  }

  values.push(id);

  const sql = `UPDATE members SET ${updates.join(", ")} WHERE id = ?`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error updating membership:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to update membership",
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Member not found"
      });
    }

    console.log(`✅ Member ${id} membership updated`);
    res.json({
      success: true,
      message: "Membership updated successfully"
    });
  });
});

// ✅ PUT update member status
router.put("/members/:id/status", (req, res) => {
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

// ✅ GET single member by ID
router.get("/members/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM members WHERE id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching member:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch member",
        details: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Member not found",
      });
    }

    res.json(results[0]);
  });
});

// ✅ PUT renew membership
router.put("/members/:id/renew", (req, res) => {
  const { id } = req.params;
  const { membership_type } = req.body;

  db.query("SELECT * FROM members WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch member" });
    if (results.length === 0) return res.status(404).json({ error: "Member not found" });

    const member = results[0];
    let newEndDate;
    const currentEndDate = member.membership_end ? new Date(member.membership_end) : new Date();
    const today = new Date();
    const baseDate = currentEndDate < today ? today : currentEndDate;

    if (membership_type === "Weekly") {
      newEndDate = new Date(baseDate);
      newEndDate.setDate(newEndDate.getDate() + 7);
    } else if (membership_type === "Monthly") {
      newEndDate = new Date(baseDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      return res.status(400).json({ error: "Invalid membership type" });
    }

    const formattedEndDate = newEndDate.toISOString().split("T")[0];

    db.query(
      "UPDATE members SET membership_end = ?, status = 'active' WHERE id = ?",
      [formattedEndDate, id],
      (errUpdate) => {
        if (errUpdate) return res.status(500).json({ error: "Failed to renew membership" });

        db.query("SELECT * FROM members WHERE id = ?", [id], (errUpdated, updatedMembers) => {
          if (errUpdated) return res.status(500).json({ error: "Failed to fetch updated member" });

          res.json({
            success: true,
            message: "Membership renewed successfully",
            member: updatedMembers[0],
          });
        });
      }
    );
  });
});

// ✅ GET all transactions
router.get("/transactions", (req, res) => {
  const query = "SELECT * FROM transactions ORDER BY transaction_datetime DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching transactions:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch transactions",
        details: err.message,
      });
    }
    res.json(results);
  });
});

// ✅ POST new transaction - Each item as separate row with same OR number and PAID status
router.post("/transactions", (req, res) => {
  const { member_name, membership_type, items, total_amount } = req.body;

  // Validate required fields
  if (!member_name || !items || items.length === 0 || !total_amount) {
    return res.status(400).json({
      success: false,
      error: "Member name and at least one item are required",
      details: "Required fields: member_name, items (array), total_amount"
    });
  }

  // Get current date
  const today = new Date().toISOString().split("T")[0];

  // Step 1: Get the next sequential transaction ID to generate ONE OR number for all items
  const getLastOrQuery = "SELECT MAX(id) as max_id FROM transactions";

  db.query(getLastOrQuery, (errLast, resultsLast) => {
    if (errLast) {
      console.error("❌ Error fetching last transaction ID:", errLast);
      return res.status(500).json({
        success: false,
        error: "Failed to generate OR number",
        details: errLast.message,
      });
    }

    let nextId = 1;
    if (resultsLast && resultsLast[0].max_id) {
      nextId = resultsLast[0].max_id + 1;
    }

    // Format OR number as "OR-0001", "OR-0002", etc.
    const orNumber = `OR-${String(nextId).padStart(4, "0")}`;

    // Step 2: Insert EACH item as a SEPARATE transaction record with the SAME OR number and PAID status
    let insertedCount = 0;
    let hasError = false;
    const transactionRecords = [];

    items.forEach((item, index) => {
      const transactionQuery = `
        INSERT INTO transactions 
        (or_number, member_name, product, quantity, total_amount, status, transaction_datetime)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      const transactionValues = [
        orNumber,  // SAME OR number for all items
        member_name.trim(),
        item.product,  // Individual product name
        item.quantity,
        item.total_amount,  // Individual item total
        "paid"  // ✅ Set status to "paid" immediately upon payment
      ];

      db.query(transactionQuery, transactionValues, (err, transResult) => {
        if (err) {
          console.error("❌ Error saving transaction item:", err);
          if (!hasError) {
            hasError = true;
            return res.status(500).json({
              success: false,
              error: "Failed to save transaction item",
              details: err.message,
            });
          }
          return;
        }

        transactionRecords.push({
          id: transResult.insertId,
          or_number: orNumber,
          member_name: member_name.trim(),
          product: item.product,
          quantity: item.quantity,
          total_amount: item.total_amount,
          status: "paid"
        });

        insertedCount++;

        // Step 3: When all items are inserted, save to appropriate table based on membership
        if (insertedCount === items.length && !hasError) {
          
          // Check if has membership plan
          const hasMembership = membership_type && membership_type.length > 0;

          if (hasMembership) {
            // HAS MEMBERSHIP → Don't save to walk_in (already saved to members during payment)
            console.log(`✅ Payment completed - OR: ${orNumber}, ${insertedCount} items, Member: ${member_name} (WITH membership), Total: ${total_amount}, Status: PAID`);
            
            res.status(201).json({
              success: true,
              message: `${insertedCount} items saved successfully under one payment (Member with membership)`,
              or_number: orNumber,
              fullname: member_name,
              total_amount: total_amount,
              itemCount: insertedCount,
              status: "paid",
              savedTo: "members",
              transactions: transactionRecords
            });
          } else {
            // NO MEMBERSHIP → Save to walk_in
            const walkinQuery = `
              INSERT INTO walk_in 
              (fullname, date)
              VALUES (?, ?)
            `;

            const walkinValues = [member_name.trim(), today];

            db.query(walkinQuery, walkinValues, (err, walkinResult) => {
              if (err) {
                console.error("❌ Error saving to walk_in table:", err);
                return res.status(500).json({
                  success: false,
                  error: "Failed to save walk-in record",
                  details: err.message,
                });
              }

              console.log(`✅ Payment completed - OR: ${orNumber}, ${insertedCount} items, Walk-in: ${member_name} (NO membership), Total: ${total_amount}, Status: PAID`);
              
              res.status(201).json({
                success: true,
                message: `${insertedCount} items saved successfully under one payment (Walk-in, no membership)`,
                or_number: orNumber,
                fullname: member_name,
                total_amount: total_amount,
                itemCount: insertedCount,
                status: "paid",
                savedTo: "walk_in",
                transactions: transactionRecords
              });
            });
          }
        }
      });
    });
  });
});

export default router;