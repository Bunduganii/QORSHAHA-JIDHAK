import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 5000;

// ── Sifalo Pay Credentials ──
const API_USERNAME = "su_ly1oib6u";
const API_KEY = "sp_srv5v0e3upvjknj539dkdekk0";

// ⚠️ IMPORTANT: no trailing slash
const SIFALO_URL = "https://api.sifalopay.com/gateway";

const AUTH_HEADER =
  "Basic " +
  Buffer.from(`${API_USERNAME}:${API_KEY}`).toString("base64");

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

// PAYMENT ROUTE
app.post("/api/pay", async (req, res) => {
  let { account, gateway, amount, currency = "USD", order_id } = req.body;

  console.log("FROM FRONTEND:", req.body);

  // 🔥 FIX: ZAAD / EVC / SAHAL → WAafi
  const g = gateway?.toLowerCase();

  if (g === "zaad" || g === "evc" || g === "sahal") {
    gateway = "waafi";
  }

  const payload = {
    account,
    gateway,
    amount: String(amount),
    currency,
    order_id: order_id || "ORD_" + Date.now(),
  };

  console.log("SENDING TO SIFALO:", payload);

  try {
    const response = await axios.post(SIFALO_URL, payload, {
      headers: {
        Authorization: AUTH_HEADER,
        "Content-Type": "application/json",
      },
    });

    console.log("SIFALO RESPONSE:", response.data);

    return res.json(response.data);
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    return res.status(500).json(
      err.response?.data || { error: err.message }
    );
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});