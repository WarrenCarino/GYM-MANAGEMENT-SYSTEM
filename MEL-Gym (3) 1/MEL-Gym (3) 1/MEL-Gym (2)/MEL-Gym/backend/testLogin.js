// C:\Users\Rona\Desktop\MEL-Gym\backend\testLogin.js
import fetch from "node-fetch"; // npm install node-fetch@2

const API_URL = "http://localhost:8081"; // backend URL

async function testLogin(email, password) {
  try {
    const res = await fetch(`${API_URL}/trainers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    console.log("=================================");
    console.log("Testing login for:", email);
    console.log("Status:", res.status);
    console.log("Response:", data);
    console.log("=================================\n");
  } catch (err) {
    console.error("Error connecting to backend:", err);
  }
}

// ✅ Test all 3 trainers
(async () => {
  await testLogin("john@example.com", "john123");
  await testLogin("sarah@example.com", "sarah123");
  await testLogin("alex@example.com", "alex123");
})();
