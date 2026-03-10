import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/product`;

const addProduct = async (formData) => {
  const token = localStorage.getItem("adminToken");

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await axios.post(`${API_URL}/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success(response.data.message);
    return response.data;
  } catch (error) {
    console.error("Error Adding Product", error);
    toast.error("Error adding product");
  }
};

const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

const fetchProductsLimit = async (page, limit) => {
  try {
    const response = await axios.get(`${API_URL}/productLimit`, {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const advancedFetch = async (filters) => {
  try {
    const { categories = [], sort, currentPage, entriesPerPage, search } = filters;
    const params = new URLSearchParams();

    if (categories.length > 0) params.append("categories", categories.join(","));

    const response = await axios.get(
      `${API_URL}/filter-products?${params.toString()}&sortBy=${sort}&page=${currentPage}&limit=${entriesPerPage}&search=${search}`
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const getProduct = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error while getting product", error);
  }
};

const editProduct = async (id, data) => {
  const token = localStorage.getItem("adminToken");
  try {
    await axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Product Updated");
  } catch (error) {
    console.log(error);
    toast.error("Error Updating Product");
  }
};

const uploadImageToStorage = async (file, oldImageUrl, oldPublicId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (oldImageUrl) {
      formData.append("oldImageUrl", oldImageUrl);
    }
    if (oldPublicId) {
      formData.append("oldPublicId", oldPublicId);
    }

    const token = localStorage.getItem("adminToken");
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.image; // Return { url, public_id }
  } catch (error) {
    console.error("Error uploading image:", error);
    toast.error("Image upload failed");
    throw new Error("Image upload failed");
  }
};

const toggleProductState = async (id) => {
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
      return response.data;
    }
  } catch (error) {
    console.error("Error toggling product status:", error);
    toast.error("Failed to update product status");
  }
};

const productCheckout = async (productIds) => {
  try {
    const token = localStorage.getItem("userToken");

    const response = await axios.post(
      `${API_URL}/product-checkout`,
      productIds,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const getTopSellingProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/top-selling/products`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchThreeNewArrivals = async () => {
  try {
    const response = await axios.get(`${API_URL}/three/new-arrivals`);
    return response.data;
  } catch (error) {
    console.error("Error fetching new arrival products:", error);
    throw error;
  }
};

export {
  addProduct,
  fetchProducts,
  getProduct,
  toggleProductState,
  editProduct,
  productCheckout,
  fetchProductsLimit,
  getTopSellingProducts,
  uploadImageToStorage,
  advancedFetch,
  fetchThreeNewArrivals,
};