import React, { useState } from "react";
import axios from "axios";

const Payment = () => {
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("zaad");
  const [amount, setAmount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handlePayment = async () => {
    if (!phone || !amount) {
      setStatus("Enter phone and amount");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const payload = {
        account: phone,
        gateway: method,
        amount: Number(amount),
      };

      console.log("Sending to backend:", payload);

      const res = await axios.post(
        "http://localhost:5000/api/pay",
        payload
      );

      console.log("Backend response:", res.data);

      setStatus("Payment request sent successfully");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setStatus("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Sifalo Payment</h2>

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      >
        <option value="zaad">ZAAD</option>
        <option value="edahab">eDahab</option>
        <option value="evc">EVC</option>
        <option value="sahal">Sahal</option>
      </select>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          background: "black",
          color: "white",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {status && <p>{status}</p>}
    </div>
  );
};

export default Payment;