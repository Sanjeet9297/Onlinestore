import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/wishlist`;

//Add product to wishlist
const addToWishlist = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/`, data);

    if (response.status === 200) {
      toast.success(response.data.message);
      return true;
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        toast.error(error.response.data.message);
      } else if (error.response.status === 400) {
        toast.warn(error.response.data.message);
      } else {
        toast.error("Error adding product to wishlist");
      }
    } else {
      toast.error("Network error or server is not responding");
    }
  }
};

//Fetching wishlist
const fetchWishlist = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//Remove Product from wishlist
const removeProduct = async (userId, productID) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${userId}/product/${productID}`
    );

    if (response.status === 200) {
      toast.success("Product removed from wishlist");
    }
  } catch (error) {
    console.log(error);
  }
};
export { addToWishlist, fetchWishlist, removeProduct };
