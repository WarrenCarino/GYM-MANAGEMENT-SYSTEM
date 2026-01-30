import { db } from "./db.js";   // your existing db connection
import bcrypt from "bcrypt";

async function hashAllTrainerPasswords() {
  try {
    // 1️⃣ Fetch all trainers
    const [trainers] = await db.promise().query("SELECT trainer_id, password FROM trainers_table");

    for (const trainer of trainers) {
      const plainPassword = trainer.password;

      // Skip if already hashed (optional: check if length > 20)
      if (plainPassword.length > 20) continue;

      // 2️⃣ Hash password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // 3️⃣ Update in database
      await db.promise().query("UPDATE trainers_table SET password = ? WHERE trainer_id = ?", [hashedPassword, trainer.trainer_id]);

      console.log(`✅ Password hashed for trainer_id ${trainer.trainer_id}`);
    }

    console.log("🎉 All trainer passwords are now hashed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error hashing passwords:", err);
    process.exit(1);
  }
}

hashAllTrainerPasswords();
