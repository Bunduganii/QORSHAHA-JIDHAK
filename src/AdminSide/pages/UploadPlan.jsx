import React, { useState } from "react";
import "../../AdminSide/Upload.css";
import { createPortal } from "react-dom";
import axios from "axios";
import { supabase } from "../../Supabase";
import toast from "react-hot-toast";

const UploadPlan = ({ isOpen, onClose, onPlanCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    price_cash: "",
    duration: "",
    category: "",
    status: true,
    features: ["", "", "", "", "", ""],
  });
const handleFeatureChange = (index, value) => {
  const updatedFeatures = [...formData.features];
  updatedFeatures[index] = value;

  setFormData({
    ...formData,
    features: updatedFeatures,
  });
};
  const [preview, setPreview] = useState(null);


  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  const planPayload = {
    name: formData.title,
    tier: formData.category || "Standard",
    description: formData.description,
    price: formData.price ? Number(formData.price) : null,
    price_cash: formData.price_cash ? Number(formData.price_cash) : null,
    duration: formData.duration || "1 Bishii",
    active: formData.status,
    features: formData.features.filter(f => f && f.trim() !== ""),
  };

  try {
    // 1. Save to Flask PostgreSQL backend
    const res = await axios.post("http://localhost:5000/api/plans", planPayload);
    console.log("Backend plan saved:", res.data);

    // 2. Also save to Supabase if connected
    try {
      await supabase.from("plans").insert([planPayload]);
    } catch (sErr) {
      console.warn("Supabase plan sync notice:", sErr);
    }

    toast.success("Plan created successfully! 🎉");

    setFormData({
      title: "",
      description: "",
      price: "",
      price_cash: "",
      duration: "",
      category: "",
      status: true,
      features: ["", "", "", "", "", ""],
    });

    if (onPlanCreated) onPlanCreated();
    onClose();

  } catch (error) {
    console.error("Failed to create plan:", error);
    toast.error(error.response?.data?.error || "Failed to create plan.");
  }
};

  return createPortal(
    <div className="upload-overlay">
      <div className="upload-modal">

        <div className="upload-header">
          <div>
            <h2>Create New Plan</h2>
            <p>Create a new fitness plan for your users.</p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="input-group">
              <label>Plan Name</label>

              <input
                type="text"
                name="title"
                placeholder="Premium Muscle Gain"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>

                <option>Weight Loss</option>

                <option>Muscle Gain</option>

                <option>Strength</option>

                <option>Home Workout</option>

                <option>Women's Fitness</option>

              </select>
            </div>

            <div className="input-group">
              <label>Price ($)</label>

              <input
                type="number"
                name="price"
                placeholder="50"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Price (Cash/SLSH)</label>

              <input
                type="number"
                name="price_cash"
                placeholder="300000"
                value={formData.price_cash}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Duration</label>

              <input
                type="text"
                name="duration"
                placeholder="3 Months"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="input-group full-width">

            <label>Description</label>

            <textarea
              rows="5"
              name="description"
              placeholder="Describe this plan..."
              value={formData.description}
              onChange={handleChange}
            />

          </div>
          <div className="input-group full-width">
  <label>Plan Features</label>

  <div className="features-grid">
    {formData.features.map((feature, index) => (
      <input
        key={index}
        type="text"
        placeholder={`Feature ${index + 1}`}
        value={feature}
        onChange={(e) =>
          handleFeatureChange(index, e.target.value)
        }
      />
    ))}
  </div>
</div>

       

          <div className="status-row">

            <label className="switch">

              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
              />

              <span className="slider"></span>

            </label>

            <span>
              {formData.status ? "Active Plan" : "Inactive Plan"}
            </span>

          </div>

          <div className="button-group">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              
            >
              Create Plan
            </button>

          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};

export default UploadPlan;