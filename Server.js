import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { Buffer } from "buffer";

dotenv.config();

const app = express();
const PORT = 5000;

// ── Sifalo Pay Credentials ──
const API_USERNAME = process.env.SIFALO_USER || "su_gd4y3v8v";
const API_KEY = process.env.SIFALO_KEY || "sp_h0sps9ok55ieov45cq0xo3mcf";

// ── Email Transporter (Gmail Alerts) ──
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "hamsesaedsnm@gmail.com",
    pass: process.env.GMAIL_PASS || "", // optional app password if configured
  },
});

async function sendCoachEmailAlert(details) {
  const { plan_name, amount, currency, account, gateway, transactionId, user_name, phone } = details;
  const mailOptions = {
    from: '"Qorshaha Jidhka" <hamsesaedsnm@gmail.com>',
    to: "hamsesaedsnm@gmail.com",
    subject: `🚨 LACAG BIXIN CUSUB: ${plan_name} (${currency === "USD" ? "$" + amount : amount + " SLSH"})`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 25px; border-radius: 12px;">
        <h2 style="color: #00ffa6;">🏋️ QORSHAHA JIDHKA — LACAG BIXIN CUSUB!</h2>
        <p>Waxaa la helay lacag bixin cusub oo lagu bixiyey <strong>${gateway}</strong>.</p>
        <hr style="border-color: #1e293b;" />
        <table style="width: 100%; color: #e2e8f0; font-size: 15px;">
          <tr><td><strong>Macmiilka:</strong></td><td>${user_name || "Macmiil"}</td></tr>
          <tr><td><strong>Talifoonka:</strong></td><td>${phone || account}</td></tr>
          <tr><td><strong>Qorshaha:</strong></td><td>${plan_name || "—"}</td></tr>
          <tr><td><strong>Qiimaha:</strong></td><td>${currency === "USD" ? "$" + amount : amount + " SLSH"}</td></tr>
          <tr><td><strong>Qaabka:</strong></td><td>${gateway} (Sifalo Pay)</td></tr>
          <tr><td><strong>Transaction ID:</strong></td><td><code>${transactionId}</code></td></tr>
        </table>
        <hr style="border-color: #1e293b;" />
        <p style="color: #00d9ff; font-weight: bold;">Fadlan ka eeg Admin Dashboard-ka ama WhatsApp-ka si aad u siiso qorshihiisa!</p>
      </div>
    `,
  };

  try {
    if (process.env.GMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email alert sent to hamsesaedsnm@gmail.com");
    } else {
      console.log("ℹ️ Email notification logged (Set GMAIL_PASS in .env to send live emails):", mailOptions.subject);
    }
  } catch (mailErr) {
    console.error("Email send error:", mailErr.message);
  }
}

// ⚠️ IMPORTANT: trailing slash is required — without it Apache 301-redirects,
// and Axios loses the POST body on redirect, causing "Required parameters missing."
const SIFALO_URL = "https://api.sifalopay.com/gateway/";

const getAuthHeader = () => {
  const creds = `${API_USERNAME}:${API_KEY}`;
  if (typeof Buffer !== "undefined") {
    return "Basic " + Buffer.from(creds).toString("base64");
  }
  return "Basic " + btoa(creds);
};

app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (_req, res) => {
  res.json({ message: "Qorshaha Jidhka Payment Backend Server Active ✅", health: "/health", status: "online" });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

// ── Gateway name normalizer ──
// Sifalo only accepts: "waafi" | "edahab"
// waafi covers: zaad, evc, sahal, evc plus, waafi
// edahab covers: edahab, e-dahab
function normalizeGateway(raw = "") {
  const g = raw.toLowerCase().replace(/[\s\-_+]/g, "");
  if (["zaad", "evc", "evcplus", "sahal", "waafi"].includes(g)) return "waafi";
  if (["edahab", "edahab"].includes(g)) return "edahab";
  // card → pass through (Sifalo handles it separately)
  return g;
}

// PAYMENT ROUTE
app.post("/api/pay", async (req, res) => {
  let { account, gateway, amount, currency = "USD", order_id } = req.body;

  console.log("FROM FRONTEND:", req.body);

  // Normalize gateway name
  gateway = normalizeGateway(gateway);

  let cleanAccount = String(account).replace(/[\s\-\+\(\)]/g, "");
  if (cleanAccount.startsWith("0")) {
    cleanAccount = cleanAccount.slice(1);
  }
  if (!cleanAccount.startsWith("252")) {
    cleanAccount = "252" + cleanAccount;
  }

  // Strip dollar signs or non-numeric symbols from amount
  const cleanAmount = String(amount).replace(/[^0-9.]/g, "") || "10";

  const payload = {
    account: cleanAccount,
    gateway,
    amount: cleanAmount,
    currency,
    order_id: order_id || "ORD_" + Date.now(),
  };

  console.log("\n=================== INCOMING PAYMENT REQUEST ===================");
  console.log("FROM FRONTEND:", req.body);
  console.log("SENDING TO SIFALO:", payload);

  try {
    const response = await axios.post(SIFALO_URL, payload, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // Sifalo holds this connection open until user enters PIN on phone (code 601)
      // or until it times out. Must be long enough for user to see pop-up and enter PIN.
      timeout: 120000,
      maxRedirects: 0,
    });

    const sifaloData = response.data;
    console.log("SIFALO RESPONSE:", JSON.stringify(sifaloData));
    console.log("=================================================================\n");

    // Sifalo code 601 = "Your Transaction has been Processed!" (Money Deducted & Confirmed ✅)
    // Sifalo code 0 with response null = USSD Push Initiated (Waiting for PIN on phone ⏳)
    const code = String(sifaloData?.code);
    const isCompleted = (code === "601") || (code === "200") || (code === "0" && sifaloData?.response && sifaloData.response.toLowerCase().includes("processed"));

    if (isCompleted) {
      const txId = sifaloData.sid || sifaloData.transactionId || order_id || "ORD_" + Date.now();
      
      // Dispatch instant email alert to hamsesaedsnm@gmail.com
      sendCoachEmailAlert({
        plan_name: req.body.plan_name || "Qorshaha Jidhka",
        amount: cleanAmount,
        currency: currency,
        account: cleanAccount,
        gateway,
        transactionId: txId,
        user_name: req.body.user_name || "Macmiil",
        phone: req.body.phone || account,
      });

      // Payment fully confirmed by Sifalo Pay ✅
      return res.json({
        success: true,
        code: sifaloData.code,
        sid: sifaloData.sid,
        response: sifaloData.response,
        transactionId: txId,
      });
    } else if (code === "0" || code === "603") {
      // USSD push sent to phone screen, waiting for PIN entry
      return res.json({
        success: false,
        pending: true,
        code: sifaloData?.code,
        sid: sifaloData?.sid,
        message: "Codsiga waxaa loo diray talifoonkaaga. Fadlan geli PIN-kaaga Zaad / EVC Plus shaashadda talifoonkaaga ka soo muuqday.",
      });
    } else {
      // Payment Failed (code 600) or rejected ❌
      return res.json({
        success: false,
        code: sifaloData?.code || "600",
        message: sifaloData?.response || "Lacagta ma aadan bixin ama PIN-ka ayaa gar ah. Isku day mar kale.",
        sid: sifaloData?.sid,
      });
    }
  } catch (err) {
    console.error("SIFALO ERROR:", err.response?.data || err.message);
    return res.json({
      success: false,
      message: err.response?.data?.response || err.response?.data?.error || err.message || "Lacag bixinta waa ku guuldareysatay. Isku day mar kale.",
    });
  }
});

// STATUS CHECK ENDPOINT FOR BACKGROUND POLLING
app.post("/api/check-payment", async (req, res) => {
  let { account, gateway, amount, currency = "USD", order_id, sid } = req.body;
  gateway = normalizeGateway(gateway);

  let cleanAccount = String(account).replace(/[\s\-\+\(\)]/g, "");
  if (cleanAccount.startsWith("0")) cleanAccount = cleanAccount.slice(1);
  if (!cleanAccount.startsWith("252")) cleanAccount = "252" + cleanAccount;
  const cleanAmount = String(amount).replace(/[^0-9.]/g, "") || "10";

  // Use the SAME order_id from the initial push (not a new one)
  // Also pass sid if Sifalo returned one — helps them look up existing transaction
  const payload = {
    account: cleanAccount,
    gateway,
    amount: cleanAmount,
    currency,
    order_id: order_id,  // same order_id as the initial /api/pay call
  };
  if (sid) payload.sid = sid;

  console.log(`\n[CHECK-PAYMENT] Checking status for order ${order_id}:`, payload);

  try {
    const response = await axios.post(SIFALO_URL, payload, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
      maxRedirects: 0,
    });

    const sifaloData = response.data;
    const code = String(sifaloData?.code);
    const isCompleted = (code === "601") || (code === "200") || (code === "0" && sifaloData?.response && sifaloData.response.toLowerCase().includes("processed"));

    if (isCompleted) {
      const txId = sifaloData.sid || sifaloData.transactionId || order_id || "ORD_" + Date.now();
      
      sendCoachEmailAlert({
        plan_name: req.body.plan_name || "Qorshaha Jidhka",
        amount: cleanAmount,
        currency,
        account: cleanAccount,
        gateway,
        transactionId: txId,
        user_name: req.body.user_name || "Macmiil",
        phone: req.body.phone || account,
      });

      return res.json({
        success: true,
        code: sifaloData.code,
        sid: sifaloData.sid,
        response: sifaloData.response,
        transactionId: txId,
      });
    } else if (code === "0" || code === "603") {
      return res.json({
        success: false,
        pending: true,
        code: sifaloData?.code,
        sid: sifaloData?.sid,
        message: "Codsiga waa la sugaa PIN-ka...",
      });
    } else {
      return res.json({
        success: false,
        pending: false,
        code: sifaloData?.code || "600",
        message: sifaloData?.response || "Lacagta ma aadan bixin ama PIN-ka ayaa gar ah.",
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      pending: true,
      message: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running → http://localhost:${PORT}`);
});