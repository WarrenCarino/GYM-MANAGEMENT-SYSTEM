import { db } from "../db.js";

export function recordAudit(id, role, action, status = "success") {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO audit_trail (id, role, action, status, timestamp)
      VALUES (?, ?, ?, ?, NOW())
    `;
    db.query(sql, [id, role, action, status], (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}
