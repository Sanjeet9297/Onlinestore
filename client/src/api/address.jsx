import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/address`;

//add new address
const addAddress = async (data, userId) => {
  const token = localStorage.getItem("userToken");

  try {
    const response = await axios.post(`${API_URL}/address/${userId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if(response.status === 201){
      toast.success("New Address Added");
      return response.data;
    }
  } catch (error) {
    console.log(error)
    toast.error("Error While Saving Address")
  }
};

//fetching all address;
const getAddress = async(userId) => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await axios.get(`${API_URL}/address/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

//fetching default address;
const getDefaultAddress = async(userId) => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await axios.get(`${API_URL}/default-address/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

//Edit address
const editAddress = async(data, id) => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await axios.put(`${API_URL}/address/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if(response.status === 200){
      toast.success("Updated Your Address");
    }
  } catch (error) {
    console.log(error);
    if(error.response.status === 400){
      toast.error("No Address Found!")
    }else {
      toast.error("Plese Tryagain Later!");
    }
  }
}

//delete Address
const delAddress = async(id) => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await axios.delete(`${API_URL}/address/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if(response.status === 200){
      toast.success("Address Deleted!");
    }
  } catch (error) {
    console.log(error)
  }
}

export { addAddress, getAddress, editAddress, delAddress, getDefaultAddress };
