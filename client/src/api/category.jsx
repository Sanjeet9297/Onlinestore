import axios from 'axios';
import {toast} from 'react-toastify'

const API_URL = `${import.meta.env.VITE_API_URL}/category`;

// FETCH CATEGORIES
const fetchCategories = async () => {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await axios.get(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// ADD CATEGORY
const addCategory = async (categoryData) => {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await axios.post(`${API_URL}/`, categoryData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding category:', error);
  }
};

// EDIT CATEGORY
const editCategory = async (categoryId, categoryData) => {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await axios.patch(
      `${API_URL}/${categoryId}`,
      categoryData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error editing category:', error);
  }
};

//Toggle Delete/Recover Function
const toggleCategoryStatus = async (categoryId) => {
  const token = localStorage.getItem('adminToken');
  try {
    const response = await axios.patch(
      `${API_URL}/toggle/${categoryId}`,
      {}, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data) {
      toast.success(response.data.message); 
      return response.data; 
    }
  } catch (error) {
    console.error('Error toggling category status:', error);
    toast.error('Failed to update category status');
  }
};

//Top selling categories
const getTopSellingCategories = async() => {
  try {
    const response = await axios.get(`${API_URL}/top-selling/categories`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export { fetchCategories, addCategory, editCategory, toggleCategoryStatus, getTopSellingCategories };
