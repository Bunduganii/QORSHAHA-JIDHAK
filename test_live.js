import axios from "axios";
import { Buffer } from "buffer";

const API_USERNAME = "su_gd4y3v8v";
const API_KEY = "sp_h0sps9ok55ieov45cq0xo3mcf";
const SIFALO_URL = "https://api.sifalopay.com/gateway/";
const AUTH_HEADER = "Basic " + Buffer.from(`${API_USERNAME}:${API_KEY}`).toString("base64");

const ORDER_ID = "ORD_" + Date.now();

console.log("\n=================== SIFALO LIVE TEST ===================");
console.log("Sending USSD push to 252633996646 via waafi...");
console.log("ORDER ID:", ORDER_ID);

const payload = {
  account: "252633996646",
  gateway: "waafi",
  amount: "1000",
  currency: "SLSH",
  order_id: ORDER_ID
};

console.log("Payload:", payload);

try {
  const res = await axios.post(SIFALO_URL, payload, {
    headers: {
      Authorization: AUTH_HEADER,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    timeout: 60000
  });

  console.log("\nHTTP STATUS:", res.status);
  console.log("SIFALO RESPONSE:", res.data);
  console.log("CODE:", res.data.code);
  console.log("SID:", res.data.sid);
  console.log("RESPONSE MSG:", res.data.response);

  if (String(res.data.code) === "601") {
    console.log("\n✅ PAYMENT CONFIRMED! User entered PIN successfully.");
  } else if (String(res.data.code) === "0") {
    console.log("\n📱 USSD push sent to phone. Waiting for user to enter PIN...");
    console.log("Now polling for completion every 3 seconds...\n");

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const checkPayload = {
        account: "252633996646",
        gateway: "waafi",
        amount: "1000",
        currency: "SLSH",
        order_id: ORDER_ID,  // SAME order_id
        sid: res.data.sid    // SAME sid
      };

      try {
        const checkRes = await axios.post(SIFALO_URL, checkPayload, {
          headers: {
            Authorization: AUTH_HEADER,
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          timeout: 10000
        });
        console.log(`Poll #${attempts} [${ORDER_ID}]:`, checkRes.data);

        if (String(checkRes.data.code) === "601") {
          console.log("\n✅ PAYMENT CONFIRMED! User entered PIN. Code 601 received.");
          clearInterval(interval);
        } else if (String(checkRes.data.code) === "600") {
          console.log("\n❌ PAYMENT FAILED. User cancelled or wrong PIN.");
          clearInterval(interval);
        }
      } catch (e) {
        console.log(`Poll #${attempts} error:`, e.message);
      }

      if (attempts >= 15) {
        console.log("\n⏰ Timeout after 45 seconds.");
        clearInterval(interval);
      }
    }, 3000);
  } else {
    console.log("\n❌ Unexpected response code:", res.data.code);
  }
} catch (err) {
  if (err.response) {
    console.log("HTTP ERROR:", err.response.status, err.response.data);
  } else {
    console.log("NETWORK ERROR:", err.message);
  }
}
