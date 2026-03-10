import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/order`;

const createOrder = async (orderDetails) => {
  try {
    const token = localStorage.getItem("userToken");

    const response = await axios.post(`${API_URL}/`, orderDetails, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 201) {
      toast.success("You placed an order");
      return true;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUserOrders = async (userId, page, limit) => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await axios.get(`${API_URL}/${userId}`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getOrderProducts = async (orderId) => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await axios.get(`${API_URL}/${orderId}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Cancel order
const cancelOrder = async (orderId, uid) => {
  try {
    const token = localStorage.getItem("userToken");

    await axios.delete(`${API_URL}/${orderId}/${uid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success("Order Cancelled");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Return order
const returnOrder = async (orderId, uid) => {
  try {
    const token = localStorage.getItem("userToken");

    await axios.delete(`${API_URL}/order-return/${orderId}/${uid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success("Order Returned");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Get all orders
const getOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Get orders for pagination
const orderLimit = async (page, limit) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.get(`${API_URL}/limitOrders`, {
      params: {
        page,
        limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Search orders by order ID or username
const searchOrders = async (searchKey, page, limit) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      throw new Error("Admin token not found");
    }
    const response = await axios.get(
      `${API_URL}/search-orders?searchKey=${encodeURIComponent(
        searchKey.trim()
      )}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error searching orders:", error);
    return { allOrders: [], totalOrders: 0 };
  }
};

// Change status
const changeStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.patch(
      `${API_URL}/change-status?status=${status}&orderId=${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success(response.data.message);
      return response.data;
    }
  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.message || "Error updating status");
    throw error;
  }
};

// Change payment status
const changePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const token = localStorage.getItem("adminToken");
    await axios.patch(
      `${API_URL}/payment-status?paymentStatus=${paymentStatus}&orderId=${orderId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.message || "Error updating payment status");
    throw error;
  }
};

// Sales report
const salesReport = async (date) => {
  const token = localStorage.getItem("adminToken");
  try {
    const response = await axios.post(`${API_URL}/sales-report`, date, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export {
  createOrder,
  getUserOrders,
  getOrderProducts,
  cancelOrder,
  getOrders,
  changeStatus,
  salesReport,
  changePaymentStatus,
  orderLimit,
  returnOrder,
  searchOrders,
};