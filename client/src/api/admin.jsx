import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/admin`;

// ADMIN--LOGIN
const adminlogin = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/admin-login`, userData);
    if (response.status === 200 && response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error While Admin login:", error);
    return false;
  }
};

// FETCH--ALL-USERS
const fetchUsersPagination = async (page, limit) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.get(
      `${API_URL}/all-users-limit?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { allUsers: [], totalUsers: 0 };
  }
};

//FETCH--USERS
const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.get(`${API_URL}/all-users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { allUsers: [], totalUsers: 0 };
  }
};

// BLOCK USER
const blockUser = async (userId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.patch(
      `${API_URL}/${userId}/block`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error blocking user:", error);
  }
};

// UNBLOCK USER
const unblockUser = async (userId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.patch(
      `${API_URL}/${userId}/unblock`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error unblocking user:", error);
  }
};

//SEARCH USER
const searchUsers = async (searchKey, page, limit) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.get(
      `${API_URL}/search-users?searchKey=${encodeURIComponent(
        searchKey
      )}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      allUsers: response.data.allUsers,
      totalUsers: response.data.totalUsers,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return { allUsers: [], totalUsers: 0 };
  }
};

//SEARCH PRODUCTS
const searchProducts = async (searchKey, page, limit) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await axios.get(
      `${API_URL}/search-products?searchKey=${encodeURIComponent(
        searchKey
      )}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      products: response.data.products,
      totalProducts: response.data.totalProducts,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [], totalProducts: 0 };
  }
};

//ADMIN LOGOUT
const adminLogoutFunction = async () => {
  localStorage.removeItem("adminToken");
  toast.success("You have successfully logged out!");
};

export {
  adminlogin,
  fetchUsers,
  fetchUsersPagination,
  blockUser,
  unblockUser,
  adminLogoutFunction,
  searchUsers,
  searchProducts,
};
