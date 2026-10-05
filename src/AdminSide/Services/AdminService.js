import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Dashboard Stats
export async function getDashboardStats() {
  try {
    const res = await axios.get(`${API_BASE}/admin/stats`);
    return res.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalRevenueUSD: 0,
      totalRevenueCash: 0,
      totalClients: 0,
      paidClients: 0,
      activeCoaching: 0,
      pendingPayments: 0,
      reviewPayments: 0,
      planCounts: {},
      methodCounts: {}
    };
  }
}

// Search and Filter Payments
export async function getPayments(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/admin/payments`, { params });
    return res.data;
  } catch (error) {
    console.error("Error searching payments:", error);
    return [];
  }
}

// Coach Access Code Lookup
export async function getCoachClientByAccessCode(accessCode) {
  try {
    const res = await axios.get(`${API_BASE}/admin/coach-access/${encodeURIComponent(accessCode)}`);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Access code not found or invalid"
    };
  }
}

// Manual Status Update (e.g. PAYMENT_REVIEW -> PAID)
export async function updatePaymentStatus(orderId, status) {
  try {
    const res = await axios.patch(`${API_BASE}/admin/payments/${orderId}/status`, { status });
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update payment status"
    };
  }
}

// ── BLOG ARTICLES MANAGEMENT ──
export async function getAdminArticles(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/articles`, { params: { status: "all", ...params } });
    return res.data;
  } catch (error) {
    console.error("Error fetching admin articles:", error);
    return [];
  }
}

export async function createArticle(articleData) {
  try {
    const res = await axios.post(`${API_BASE}/articles`, articleData);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to create article"
    };
  }
}

export async function updateArticle(articleId, articleData) {
  try {
    const res = await axios.put(`${API_BASE}/articles/${articleId}`, articleData);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update article"
    };
  }
}

export async function deleteArticle(articleId) {
  try {
    const res = await axios.delete(`${API_BASE}/articles/${articleId}`);
    return { success: true, data: res.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete article"
    };
  }
}

// ── EMAIL & SUBSCRIBERS MANAGEMENT ──
export async function getSubscribers(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/subscriptions`, { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }
}

export async function getAllCollectedEmails(params = {}) {
  try {
    const res = await axios.get(`${API_BASE}/admin/all-emails`, { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching all collected emails:", error);
    return { total_count: 0, emails: [] };
  }
}