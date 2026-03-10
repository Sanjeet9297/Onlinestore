import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}/offer`;

const getAllOffers = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const createOffer = async(offerData) => {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await axios.post(`${API_URL}/`, offerData, {
            headers: {
                Authorization: `Bearer, ${token}`
            }
        });

        console.log(response);
        if(response.status === 201){
            toast.success("New Offer Created");
            return response.data;
        }
    } catch (error) {
        console.log(error);
    }
};

//edit offer
const updateOffer = async(offerId, offerData) => {
  const token = localStorage.getItem('adminToken');
  try {
    await axios.put(`${API_URL}/${offerId}`, offerData, {
      headers: {Authorization : `Bearer ${token}`}
    });

    toast.success("Offer Updated")
  } catch (error) {
    console.log(error);
    toast.error("Error while updating offer");
  }
}

//Delete offer
const deleteOffer = async (offerId) => {
  const token = localStorage.getItem('adminToken');
  try {
    await axios.delete(`${API_URL}/${offerId}`, {
      headers: {Authorization: `Bearer ${token}`}
    });

    toast.success("Offer Deleted");
  } catch (error) {
    console.log(error);
    toast.error("Error While Deleting Offer!");
  }
}

//GET ACTIVE OFFER (USER);
const getActiveOffer = async() => {
  try {
    const response = await axios.get(`${API_URL}/activeOffer`);

    return response.data;
  } catch (error) {
    console.log(error)
    return error;
  }
}

export { getAllOffers, createOffer, updateOffer, getActiveOffer, deleteOffer };
