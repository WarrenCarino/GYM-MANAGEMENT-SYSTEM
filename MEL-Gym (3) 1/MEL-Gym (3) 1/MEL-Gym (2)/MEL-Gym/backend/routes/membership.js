import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET all membership plans grouped by name
router.get("/plans", (req, res) => {
  const query = `
    SELECT 
      membershipplan_id,
      membershipplanname,
      membershipplanbenefits
    FROM membership_plan
    ORDER BY membershipplanname ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching membership plans:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Server error" 
      });
    }

    // Group plans by plan name
    const plans = {};

    results.forEach(row => {
      const name = row.membershipplanname.toUpperCase();

      if (!plans[name]) {
        plans[name] = {
          id: row.membershipplan_id,
          name: name,
          price: "",          // You can add price later
          highlight: false,   // You can control which plan is highlighted
          features: []
        };
      }

      plans[name].features.push(row.membershipplanbenefits);
    });

    res.json(Object.values(plans));
  });
});

export default router;
