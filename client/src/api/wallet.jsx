import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/wallet`;

const getUserWallet = async (userId, page, limit) => {
  const token = localStorage.getItem("userToken");
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.walletDetails[0];
  } catch (error) {
    console.log(error);
  }
};

export { getUserWallet };
