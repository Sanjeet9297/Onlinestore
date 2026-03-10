import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/coupon`;

const fetchCoupons = async () => {
  try {
    const token = localStorage.getItem("userToken")
    const response = await axios.get(`${API_URL}/`, {
      headers: {
        Authorization: `Bearer, ${token}`,
      }
    });

    return response.data.coupons;
  } catch (error) {
    console.log(error);
  }
};

//fetch with limit (pagination)
const fetchCouponsLimit = async (page, limit) => {
  const token = localStorage.getItem("adminToken")
  try {
    const response = await axios.get(`${API_URL}/couponLimit`, {
      params: {
        page,
        limit,
      },
      headers: {
        Authorization: `Bearer, ${token}`,
      }
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const createCoupon = async (couponData) => {
  const token = localStorage.getItem("adminToken");
  try {
    const response = await axios.post(`${API_URL}/`, couponData, {
      headers: {
        Authorization: `Bearer, ${token}`,
      },
    });
    console.log(response);
    toast.success("Coupon Created!! ");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//edit coupon
const updateCoupon = async (id, couponData) => {
  const token = localStorage.getItem("adminToken");
  try {
    await axios.put(
      `${API_URL}/coupon/${id}`,
      couponData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success("Updated Coupon");
  } catch (error) {
    console.log(error);
    toast.error("Error Updating Coupon!");
  }
};

//toggle coupon state
const toggleCouponState = async (id) => {
  const token = localStorage.getItem("adminToken");
  try {
    const response = await axios.patch(
      `${API_URL}/toggle/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      toast.success(response.data.message);
      console.log(response.data);
      return response.data;
    }
  } catch (error) {
    console.error("Error toggling Coupon status:", error);
    toast.error("Failed to update Coupon status");
  }
};

const deleteCoupon = async (id) => {
  const token = localStorage.getItem("adminToken");
  try {
    await axios.delete(`${API_URL}/coupon/${id}`, {
      headers: {
        Authorization: `Bearer, ${token}`,
      },
    });
    toast.success("Coupon Deleted!!");
  } catch (error) {
    console.log(error);
  }
};

const verifyCouponCode = async (code, uid) => {
  const token = localStorage.getItem("userToken");
  try {
    const response = await axios.post(
      `${API_URL}/verify`,
      { code, uid },
      {
        headers: {
          Authorization: `Bearer, ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    if (error.response.status === 404) {
      toast.error(error.response.data.message);
    } else if (error.response.status === 400) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Server error. Please try again later.");
    }
  }
};

export {
  fetchCoupons,
  createCoupon,
  deleteCoupon,
  verifyCouponCode,
  updateCoupon,
  toggleCouponState,
  fetchCouponsLimit,
};
