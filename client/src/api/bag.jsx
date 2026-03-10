import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/bag`;

//Add product to bag
const addToBag = async (data) => {
  try {
    await axios.post(`${API_URL}/`, data);
  } catch (error) {
    if (error.response.status === 404) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Error adding product to bag");
    }
  }
};

//get bag info
const fetchBag = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//remove product from bag
const delFromBag = async (userId, productId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${userId}/product/${productId}`
    );

    toast.success("Product Removed From Bag");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const clearBag =  async (userId) => {
  try {
    const token = localStorage.getItem('userToken');

    const response = await axios.delete(`${API_URL}/clear-bag/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log(response)
  } catch (error) {
    console.log(error);
  }
}

export { addToBag, fetchBag, delFromBag, clearBag };
