import axios from "axios";

const API_USERNAME = "su_gd4y3v8v";
const API_KEY = "sp_h0sps9ok55ieov45cq0xo3mcf";
const SIFALO_URL = "https://api.sifalopay.com/gateway/check"; // or check endpoint
const AUTH_HEADER = "Basic " + Buffer.from(`${API_USERNAME}:${API_KEY}`).toString("base64");

async function checkStatus(sid, order_id) {
  const payload = {
    sid: sid,
    order_id: order_id
  };

  console.log("Checking Sifalo status with payload:", payload);
  try {
    const res = await axios.post(SIFALO_URL, payload, {
      headers: {
        Authorization: AUTH_HEADER,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      timeout: 10000
    });
    console.log("Status Check Response:", res.status, res.data);
  } catch (err) {
    console.error("Status Check Error:", err.response?.status, err.response?.data || err.message);
  }
}

checkStatus("ORD_1785739667585", "ORD_1785739667585");
