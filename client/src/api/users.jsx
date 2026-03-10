import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/user`;

//Sign--Up
const signUp = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);

    if (response.status === 201) {
      localStorage.setItem("userToken", response.data.token);
      return response.data;
    }
  } catch (error) {
    console.error("Error signing up:", error);
    toast.error("User already exists")
  }
};

//Login
const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    console.log(response);
    if (response.status === 200) {
      toast.success("Login Successful");
      localStorage.setItem("userToken", response.data.token);
      return response.data;
    } else {
      throw new Error("Login failed");
    }
  } catch (error) {
    console.log(error);
    if(error.response.status === 403){
      toast.error(error.response.data.message);
    }
  }
};

//Storing user google info
const storeGoogleInfo = async(userData) => {
  try {
    const response = await axios.post(`${API_URL}/googleUser`, userData);
    //Saving Google user token
    localStorage.setItem("userToken", response.data.token);
    return response.data;
  } catch (error) {
    console.log(error);
    if(error.response.status === 403){
      toast.error(error.response.data.message);
    }
  }
}

//update username and email
const updateUserData = async(userData) => {
  const token = localStorage.getItem('userToken');
  try {
    const response = await axios.patch(`${API_URL}/`, userData, {
      headers:{
        Authorization: `Bearer ${token}`, 
      }
    })
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

//change password;
const changePassword = async(data) => {
  const token = localStorage.getItem('userToken');
  try {
    console.log("data frontend", data)
    const response = await axios.put(`${API_URL}/change-password`, data, {
      headers:{
        Authorization: `Bearer ${token}`, 
      }
    })

    console.log(response);
    toast.success("Password changed successfully!");
  } catch (error) {
    console.log(error);
    if(error && error.response.status === 400){
      toast.error("Current password is incorrect!");
    }else{
      toast.error("Something went wrong. Please try again later.");
    }
  }
}

//forgot password
const forgotPassword = async(email) => {
  try {
    const response = await axios.post(`${API_URL}/forgotPassword`, {email});
    console.log(response);
    toast.success(response.data.message);
    if(response.status === 200) return true;
  } catch (error) {
    console.log(error);
    toast.error(error.response.data.message);
  }
}

//forgot password verify
const forgotPasswordVerify = async (email, code, password) => {
  try {
    const response = await axios.post(`${API_URL}/forgotPassword-verify`, {email, code, password});
    console.log(response);
    if(response.status === 200) return true;
  } catch (error) {
    console.log(error);
    toast.error(error.response.data.message);
  }
}

// FETCH--ALL-USERS
const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const logout = () => {
  localStorage.removeItem('userToken');
  toast.success("You have successfully logged out!");
}

export { signUp, login, logout, storeGoogleInfo, updateUserData, changePassword, forgotPassword, forgotPasswordVerify, fetchUsers };
