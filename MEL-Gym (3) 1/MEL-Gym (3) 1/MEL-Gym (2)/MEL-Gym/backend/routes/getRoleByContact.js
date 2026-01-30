import { db } from "../db.js";

export function getRoleByContact(contact) {
  return new Promise((resolve, reject) => {
    const queries = {
      member: "SELECT id FROM members WHERE contact_number = ? LIMIT 1",
      cashier: "SELECT id FROM cashiers_login WHERE phone = ? LIMIT 1",
      trainer: "SELECT id FROM trainers_table WHERE contact_number = ? LIMIT 1",
      admin: "SELECT admin_id as id FROM admin_table WHERE contact = ? LIMIT 1",
    };

    let found = false;
    let resultData = null;

    const checkNext = (roles) => {
      if (roles.length === 0) {
        return resolve(null); // no role found
      }

      const role = roles.shift();
      db.query(queries[role], [contact], (err, results) => {
        if (err) return reject(err);

        if (results.length > 0) {
          found = true;
          resultData = { id: results[0].id, role };
          return resolve(resultData);
        }

        checkNext(roles);
      });
    };

    checkNext(["member", "cashier", "trainer", "admin"]);
  });
}
