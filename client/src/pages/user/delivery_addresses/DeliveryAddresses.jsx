import React, { useEffect, useState } from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import SettingsSidebar from "../../../components/user_components/settings_sidebar/SettingsSidebar";
import {
  addAddress,
  delAddress,
  editAddress,
  getAddress,
} from "../../../api/address";
import { useSelector } from "react-redux";

const DeliveryAddresses = () => {
  const { uid } = useSelector((state) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [address, setAddress] = useState([]);
  const [disableButton, setDisableButton] = useState(true);
  const [addressId, setAddressId] = useState("");
  const [addressChanged, setAddressChanged] = useState(false);

  useEffect(() => {
    const getAllAddress = async () => {
      const { allAddress } = await getAddress(uid);
      setAddress(allAddress);
      setAddressChanged(false);
    };

    if (uid) {
      getAllAddress();
    }
  }, [uid, addressChanged]);

  const [formValues, setFormValues] = useState({
    street: "",
    village: "",
    town: "",
    postcode: "",
    state: "",
    country: "",
    phonenumber: "",
    defaultAddress: "",
  });

  const [error, setError] = useState({});

  const [editFormValues, setEditFormValues] = useState({
    street: "",
    village: "",
    town: "",
    postcode: "",
    state: "",
    country: "",
    phonenumber: "",
  });

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setDisableButton(false);
  };

  //add address moda
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setError("");
    setIsModalOpen(false);
  };

  //edit address modal
  const openEditModal = (id) => {
    setIsEditModalOpen(true);
    setAddressId(id);
    const addressToEdit = address.find((addres) => addres._id === id);
    setEditFormValues(addressToEdit);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setDisableButton(true);
  };

  //Validate Address Form
  const validate = () => {
    let tempErrors = {};
    const specialCharPattern = /[^\w\s]/g; 
  
    // Validate street
    if (!formValues.street) {
      tempErrors.street = "Street is required";
    } else if (specialCharPattern.test(formValues.street)) {
      tempErrors.street = "Street cannot contain special characters";
    }
  
    // Validate postcode
    if (!formValues.postcode) {
      tempErrors.postcode = "Postcode is required";
    } else if (specialCharPattern.test(formValues.postcode)) {
      tempErrors.postcode = "Postcode cannot contain special characters";
    }
  
    // Validate state
    if (!formValues.state) {
      tempErrors.state = "State is required";
    } else if (specialCharPattern.test(formValues.state)) {
      tempErrors.state = "State cannot contain special characters";
    }
  
    // Validate country
    if (!formValues.country) {
      tempErrors.country = "Country is required";
    } else if (specialCharPattern.test(formValues.country)) {
      tempErrors.country = "Country cannot contain special characters";
    }
  
    // Validate phone number
    if (!formValues.phonenumber) {
      tempErrors.phonenumber = "Phone number is required";
    } else if (!/^\d+$/.test(formValues.phonenumber)) {
      tempErrors.phonenumber = "Phone number must contain only numbers";
    } else if (formValues.phonenumber.length !== 10) {
      tempErrors.phonenumber = "Phone number must be exactly 10 digits";
    }
  
    setError(tempErrors);
    return Object.keys(tempErrors).length === 0; // Returns true if no errors
  };
  

  //ADDING ADDRESS FORM SUBMIT
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (validate()) {
      const data = {
        street: formValues.street,
        village: formValues.village,
        town: formValues.town,
        postcode: formValues.postcode,
        state: formValues.state,
        country: formValues.country,
        phonenumber: formValues.phonenumber,
        defaultAddress: formValues.defaultAddress ? formValues.defaultAddress : false,
      };
      try {
        await addAddress(data, uid);
        setAddressChanged(true);
        setFormValues({
          street: "",
          village: "",
          town: "",
          postcode: "",
          state: "",
          country: "",
          phonenumber: "",
        });
        closeModal();
      } catch (error) {
        console.log(error);
      }
    }
  };

  //EDITING ADDRESS FORM SUBMIT
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    const data = {
      street: editFormValues.street,
      village: editFormValues.village,
      town: editFormValues.town,
      postcode: editFormValues.postcode,
      state: editFormValues.state,
      country: editFormValues.country,
      phonenumber: editFormValues.phonenumber,
    };
    try {
      await editAddress(data, addressId);
      setAddressChanged(true);
      closeEditModal();
    } catch (error) {
      console.log(error);
      closeEditModal();
    }
  };

  //Delete Address
  const handleDeleteAddress = async (e) => {
    e.preventDefault();
    try {
      await delAddress(addressId);
      setAddressChanged(true);

      closeEditModal();
    } catch (error) {
      console.log(error);
      closeEditModal();
    }
  };

  return (
    <div className="text-black font-clash-display min-h-screen h-fit">
      <Navbar />

      <div className="pt-14 px-36">
        <div className="flex gap-48">
          <SettingsSidebar />

          <div>
            <h1 className="text-2xl">Saved Delivery Addresses</h1>

            {address.length === 0 ? (
              <p className="text-md">
                You currently don't have any saved delivery addresses.Add an
                address here to be pre-filled for quicker checkout
              </p>
            ) : (
              address.map((addres) => (
                <div
                  className="flex justify-between mt-8 border-b pb-2"
                  key={addres._id}
                >
                  <div>
                    <h1 className="text-gray-500">{addres.street}</h1>
                    <h1 className="text-gray-500">{addres.village}</h1>
                    <h1 className="text-gray-500">
                      {addres.town}, <span>{addres.postcode}</span>
                    </h1>
                    <h1 className="text-gray-500">{addres.phonenumber}</h1>
                  </div>
                  <h3
                    className="underline font-bold cursor-pointer"
                    onClick={() => openEditModal(addres._id)}
                  >
                    Edit
                  </h3>
                </div>
              ))
            )}

            <div className="flex justify-end mt-3">
              <button
                className="btn rounded-full w-[150px] bg-black text-white"
                onClick={openModal}
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal structure */}
      {isModalOpen && (
        <>
          {/* Overlay to dim background */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div
            id="medium-modal"
            tabIndex="-1"
            className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center"
            onClick={closeModal}
          >
            <div
              className="relative w-full h-[80vh] overflow-y-auto max-w-lg max-h-full bg-white rounded-3xl shadow p-6"
              onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside modal content
            >
              {/* Modal content */}
              <div className="flex items-center justify-between p-4 md:p-5">
                <h3 className="text-xl font-medium text-black dark:text-black">
                  Add Address
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-black bg-transparent hover:bg-gray-200 hover:text-black rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-black dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Modal body */}
              <form action="" onSubmit={handleFormSubmit}>
                <div className="p-4 md:p-5 space-y-4 flex flex-col gap-7">
                  {/* <div class="relative">
                    <label
                      htmlFor="username"
                      class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                    >
                      Username*
                    </label>
                    <input
                      id="username"
                      name="username"
                      value={formValues.username}
                      onChange={handleInputChange}
                      type="text"
                      class="block w-full rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div> */}
                  <div class="relative">
                    <label
                      htmlFor="streetaddress"
                      className={`absolute -top-2 left-2 bg-white px-1 text-sm ${
                        error.street ? "text-red-500" : "text-gray-500"
                      } `}
                    >
                      Street Address*
                    </label>
                    <input
                      id="streetaddress"
                      name="street"
                      value={formValues.street}
                      onChange={handleInputChange}
                      type="text"
                      className={`block w-full rounded-md border ${
                        error.street ? "border-red-500" : "border-black"
                      }  px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
                    />
                    <p className="text-sm text-red-500">{error.street}</p>
                  </div>
                  <div class="relative">
                    <label
                      htmlFor="townorvillage"
                      class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                    >
                      Town/Village*
                    </label>
                    <input
                      id="townorvillage"
                      name="village"
                      value={formValues.village}
                      onChange={handleInputChange}
                      type="text"
                      class="block w-full rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div class="relative flex justify-between">
                    <div>
                      <label
                        htmlFor="townorcity"
                        class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                      >
                        Town/City*
                      </label>
                      <input
                        id="townorcity"
                        name="town"
                        value={formValues.town}
                        onChange={handleInputChange}
                        type="text"
                        class="block w-[200px] rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="postcode"
                        className={`absolute -top-2 left-[232px] bg-white px-1 text-sm ${
                          error.postcode ? "text-red-500" : "text-gray-500"
                        } `}
                      >
                        Postcode*
                      </label>
                      <input
                        id="postcode"
                        name="postcode"
                        value={formValues.postcode}
                        onChange={handleInputChange}
                        type="number"
                        className={`block w-[200px] rounded-md border ${
                          error.postcode ? "border-red-500" : "border-black"
                        }  px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
                      />
                      <p className="text-sm text-red-500">{error.postcode}</p>
                    </div>
                  </div>
                  <div class="relative flex justify-between">
                    <div>
                      <label
                        htmlFor="state"
                        className={`absolute -top-2 left-2 bg-white px-1 text-sm ${
                          error.state ? "text-red-500" : "text-gray-500"
                        } `}
                      >
                        State*
                      </label>
                      <input
                        id="state"
                        name="state"
                        value={formValues.state}
                        onChange={handleInputChange}
                        type="text"
                        className={`block w-[200px] rounded-md border ${
                          error.state ? "border-red-500" : "border-black"
                        }  px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
                      />
                      <p className="text-sm text-red-500">{error.state}</p>
                    </div>
                    <div>
                      <label
                        htmlFor="countryorregion"
                        className={`absolute -top-2 left-[232px] bg-white px-1 text-sm ${
                          error.country ? "text-red-500" : "text-gray-500"
                        } `}
                      >
                        Country/Region*
                      </label>
                      <input
                        id="countryorregion"
                        name="country"
                        value={formValues.country}
                        onChange={handleInputChange}
                        type="text"
                        className={`block w-[200px] rounded-md border ${
                          error.country ? "border-red-500" : "border-black"
                        }  px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
                      />
                      <p className="text-sm text-red-500">{error.country}</p>
                    </div>
                  </div>
                  <div class="relative">
                    <label
                      htmlFor="phonenumber"
                      className={`absolute -top-2 left-2 bg-white px-1 text-sm ${
                        error.phonenumber ? "text-red-500" : "text-gray-500"
                      } `}
                    >
                      Phone Number*
                    </label>
                    <input
                      id="phonenumber"
                      name="phonenumber"
                      value={formValues.phonenumber}
                      onChange={handleInputChange}
                      type="number"
                      className={`block w-full rounded-md border ${
                        error.phonenumber ? "border-red-500" : "border-black"
                      }  px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm`}
                    />
                    <p className="text-sm text-red-500">{error.phonenumber}</p>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <input
                      id="defaultAddress"
                      name="defaultAddress"
                      type="checkbox"
                      checked={formValues.defaultAddress}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded border border-black text-black bg-white checked:bg-black checked:border-black focus:ring-black focus:ring-2"
                    />
                    <label
                      htmlFor="defaultAddress"
                      className="text-black text-sm font-medium"
                    >
                      Set this as default address
                    </label>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="flex items-center p-4 md:p-5 justify-end">
                  <button
                    // onClick={handleFormSubmit}
                    type="submit"
                    className="btn rounded-full text-white bg-black hover:bg-gray focus:ring-4 focus:outline-none focus:ring-black font-medium text-sm px-5 py-2.5 text-center"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal structure */}
      {isEditModalOpen && (
        <>
          {/* Overlay to dim background */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div
            id="medium-modal"
            tabIndex="-1"
            className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center"
            onClick={closeEditModal}
          >
            <div
              className="relative w-full h-[80vh] overflow-y-auto max-w-lg max-h-full bg-white rounded-3xl shadow p-6"
              onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside modal content
            >
              {/* Modal content */}
              <div className="flex items-center justify-between p-4 md:p-5">
                <h3 className="text-xl font-medium text-black dark:text-black">
                  Edit Address
                </h3>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-black bg-transparent hover:bg-gray-200 hover:text-black rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-black dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Modal body */}
              <form action="">
                <div className="p-4 md:p-5 space-y-4 flex flex-col gap-7">
                  {/* <div class="relative">
                    <label
                      htmlFor="username"
                      class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                    >
                      Username*
                    </label>
                    <input
                      id="username"
                      name="username"
                      value={editFormValues.username}
                      onChange={handleEditInputChange}
                      type="text"
                      class="block w-full rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      required
                    />
                  </div> */}
                  <div class="relative">
                    <label
                      htmlFor="streetaddress"
                      class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                    >
                      Street Address*
                    </label>
                    <input
                      id="streetaddress"
                      name="street"
                      value={editFormValues.street}
                      onChange={handleEditInputChange}
                      type="text"
                      class="block w-full rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      required
                    />
                  </div>
                  <div class="relative">
                    <label
                      htmlFor="townorvillage"
                      class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                    >
                      Town/Village*
                    </label>
                    <input
                      id="townorvillage"
                      name="village"
                      value={editFormValues.village}
                      onChange={handleEditInputChange}
                      type="text"
                      class="block w-full rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div class="relative flex justify-between">
                    <div>
                      <label
                        htmlFor="townorcity"
                        class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                      >
                        Town/City*
                      </label>
                      <input
                        id="townorcity"
                        name="town"
                        value={editFormValues.town}
                        onChange={handleEditInputChange}
                        type="text"
                        class="block w-[200px] rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="postcode"
                        class="absolute -top-2 left-[232px] bg-white px-1 text-sm text-gray-500"
                      >
                        Postcode*
                      </label>
                      <input
                        id="postcode"
                        name="postcode"
                        value={editFormValues.postcode}
                        onChange={handleEditInputChange}
                        type="number"
                        class="block w-[200px] rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div class="relative flex justify-between">
                    <div>
                      <label
                        htmlFor="state"
                        class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                      >
                        State*
                      </label>
                      <input
                        id="state"
                        name="state"
                        value={editFormValues.state}
                        onChange={handleEditInputChange}
                        type="text"
                        class="block w-[200px] rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="countryorregion"
                        class="absolute -top-2 left-[232px] bg-white px-1 text-sm text-gray-500"
                      >
                        Country/Region*
                      </label>
                      <input
                        id="countryorregion"
                        name="country"
                        value={editFormValues.country}
                        onChange={handleEditInputChange}
                        type="text"
                        class="block w-[200px] rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      />
                    </div>
                  </div>
                  <div class="relative">
                    <label
                      htmlFor="phonenumber"
                      class="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-500"
                    >
                      Phone Number*
                    </label>
                    <input
                      id="phonenumber"
                      name="phonenumber"
                      value={editFormValues.phonenumber}
                      onChange={handleEditInputChange}
                      type="text"
                      class="block w-full rounded-md border border-black px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Modal footer */}
                <div className="flex items-center p-4 md:p-5 justify-end">
                  <button
                    onClick={handleDeleteAddress}
                    className="btn mr-2 rounded-full text-white bg-black hover:bg-gray focus:ring-4 focus:outline-none focus:ring-black font-medium text-sm px-5 py-2.5 text-center"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleEditFormSubmit}
                    className="btn rounded-full text-white bg-black hover:bg-gray focus:ring-4 focus:outline-none focus:ring-black font-medium text-sm px-5 py-2.5 text-center"
                    disabled={disableButton}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryAddresses;
