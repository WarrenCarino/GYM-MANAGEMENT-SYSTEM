import mysql from "mysql2";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "gym_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Failed to connect to MySQL:", err);
  } else {
    console.log("✅ Connected to MySQL database (gym_management).");
    connection.release();
  }
});
