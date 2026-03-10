import React, { useEffect, useState } from "react";
import {
  createOffer,
  deleteOffer,
  getAllOffers,
  updateOffer,
} from "../../api/offer";
import { fetchCategories } from "../../api/category";
import { fetchProducts } from "../../api/product";
import { toast } from "react-toastify";
import Pagination from "../user_components/pagination/Pagination";

const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reRender, setReRender] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [offerId, setOfferId] = useState([]);
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const [totalCoupons, setTotalCoupons] = useState(0);
  //modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [addOfferData, setAddOfferData] = useState({
    title: "",
    description: "",
    associatedFor: "",
    offerPrice: "",
    endDate: "",
    isActive: false,
    selectedProducts: [],
    selectedCategories: [],
  });

  // Fetch categories and products
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const { data } = await fetchCategories();
        const { allProducts } = await fetchProducts();
        setCategories(data);
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching categories", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      const { allOffers } = await getAllOffers();
      setOffers(allOffers);
    };
    fetchOffers();
  }, [reRender]);

  const handleChange = (e) => {
    const { name, type, value, checked, options } = e.target;

    if (name === "selectedProducts" || name === "selectedCategories") {
      // Collect selected values for multi-select dropdowns
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setAddOfferData((prevData) => ({
        ...prevData,
        [name]: selectedValues,
      }));
    } else {
      // Handle other input types
      setAddOfferData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleEditModal = () => {
    setIsOptionModalOpen(false);
    setIsEditModalOpen(!isEditModalOpen);

    if (!isEditModalOpen) {
      const offer = offers.find((offer) => offer._id === offerId);
      setAddOfferData({
        title: offer.title,
        description: offer.description,
        associatedFor: offer.associatedFor,
        offerPrice: offer.offerPrice,
        endDate: offer.endDate,
        isActive: offer.isActive,
        selectedProducts: offer.productsIncluded,
        selectedCategories: offer.categoryIncluded,
      });
    } else {
      setAddOfferData({});
    }
  };

  const toggleOptionModal = (id) => {
    setIsOptionModalOpen(!isOptionModalOpen);
    setOfferId(id);
  };

  //Offer Validation
  const validate = () => {
    if (addOfferData.offerPrice <= 0) {
      toast.error("Invalid Offer Price!");
      return false;
    } else if (
      (addOfferData.associatedFor === "product" &&
        addOfferData.selectedProducts === undefined) ||
      (addOfferData.associatedFor === "category" &&
        addOfferData.selectedCategories === undefined)
    ) {
      toast.error(`Please select at least one ${addOfferData.associatedFor}.`);
      return false;
    } else if (new Date(addOfferData.endDate) < new Date()) {
      toast.error("Invalid date");
      return false;
    } else if (addOfferData.title.trim() === "") {
      toast.error("Invalid Offer Title");
      return false;
    } else if (addOfferData.offerPrice > 5000) {
      toast.error("Maximum offer price is ₹5000");
      return false;
    }
    return true;
  };

  //CREATING OFFER
  const handleOfferSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      const offerData = {
        title: addOfferData.title,
        description: addOfferData.description,
        associatedFor: addOfferData.associatedFor,
        offerPrice: addOfferData.offerPrice,
        productsIncluded: addOfferData.selectedProducts,
        categoryIncluded: addOfferData.selectedCategories,
        endDate: addOfferData.endDate,
        isActive: addOfferData.isActive,
      };

      const { offer } = await createOffer(offerData);
      toggleModal();
      setOffers((prev) => [...prev, offer]);
      setReRender(!reRender);
      setAddOfferData({});
    }
  };

  //edit offer
  const handleEditOfferSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      await updateOffer(offerId, addOfferData);
      toggleEditModal();
      setReRender(!reRender);
    }
  };

  //Delete offer
  const handleDeleteOffer = async (id) => {
    await deleteOffer(id);
    setOffers(offers.filter((offer) => offer._id !== id));
    toggleOptionModal();
  };

  return (
    <div className="absolute top-14 right-0 w-[1110px]">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
          <h1 className="text-white text-2xl">Offers</h1>
          {/* <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="table-search-users"
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search for coupon"
            />
          </div> */}
          <button
            className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg"
            onClick={toggleModal}
          >
            Create Offer
          </button>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Offer Title
              </th>
              <th scope="col" className="px-6 py-3">
                Associated for
              </th>
              <th scope="col" className="px-6 py-3">
                Details
              </th>
              <th scope="col" className="px-6 py-3">
                Offer Price
              </th>
              <th scope="col" className="px-6 py-3">
                End Date
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              offers.map((offer) => (
                <tr
                  key={offer._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div className="ps-3">
                      <div className="font-normal">{offer.title}</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">{offer.associatedFor}</td>
                  <td className="px-6 py-4">show details</td>
                  <td className="px-6 py-4">{offer.offerPrice}</td>
                  <td className="px-6 py-4">
                    {new Date(offer.endDate).toDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          offer.isActive ? "bg-green-500" : "bg-red-500"
                        } me-2`}
                      ></div>
                      {offer.isActive ? "Active" : "In Active"}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex">
                    <button
                      onClick={() => toggleOptionModal(offer._id)}
                      className="underline text-blue-500"
                    >
                      Options
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          className="mx-auto"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          // totalEntries={totalCoupons}
          entriesPerPage={entriesPerPage}
        />
      </div>

      {/* Add Offer Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          onClick={toggleModal}
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700 h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Offer
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={toggleModal}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.293l5.646-5.647a.5.5 0 0 1 .708.708L10.707 9l5.647 5.646a.5.5 0 0 1-.708.708L10 9.707l-5.646 5.647a.5.5 0 0 1-.708-.708L9.293 9 3.646 3.354a.5.5 0 0 1 .708-.708L10 8.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleOfferSubmit}>
              <div className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Offer Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={addOfferData.title}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Offer Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={addOfferData.description}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="associatedFor"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Associated For
                  </label>
                  <select
                    id="associatedFor"
                    value={addOfferData.associatedFor}
                    onChange={handleChange}
                    name="associatedFor"
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  >
                    <option value="">Select Type</option>
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                {/* Conditionally render based on selected value */}
                {addOfferData.associatedFor === "product" && (
                  <div>
                    <label
                      htmlFor="allProducts"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      All Products
                    </label>
                    <select
                      id="allProducts"
                      name="selectedProducts"
                      multiple
                      value={addOfferData.selectedProducts}
                      onChange={handleChange}
                      className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {addOfferData.associatedFor === "category" && (
                  <div>
                    <label
                      htmlFor="categories"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Categories
                    </label>
                    <select
                      id="categories"
                      name="selectedCategories"
                      multiple
                      value={addOfferData.selectedCategories}
                      onChange={handleChange}
                      className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="offerPrice"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Offer Price
                  </label>
                  <input
                    type="number"
                    id="offerPrice"
                    value={addOfferData.offerPrice}
                    onChange={handleChange}
                    name="offerPrice"
                    placeholder="₹2000"
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={addOfferData.endDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    name="endDate"
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <input
                      type="checkbox"
                      name="isActive"
                      value={addOfferData.isActive}
                      onChange={handleChange}
                      id="isActive"
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  className="text-gray-500 bg-transparent hover:bg-gray-200 rounded-lg px-5 py-2.5 text-sm dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5 text-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Add Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Offer Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          onClick={toggleEditModal}
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700 h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Offer
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={toggleEditModal}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.293l5.646-5.647a.5.5 0 0 1 .708.708L10.707 9l5.647 5.646a.5.5 0 0 1-.708.708L10 9.707l-5.646 5.647a.5.5 0 0 1-.708-.708L9.293 9 3.646 3.354a.5.5 0 0 1 .708-.708L10 8.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditOfferSubmit}>
              <div className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Offer Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={addOfferData.title}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Offer Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={addOfferData.description}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="associatedFor"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Associated For
                  </label>
                  <select
                    id="associatedFor"
                    value={addOfferData.associatedFor}
                    onChange={handleChange}
                    name="associatedFor"
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  >
                    <option value="">Select Type</option>
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                {/* Conditionally render based on selected value */}
                {addOfferData.associatedFor === "product" && (
                  <div>
                    <label
                      htmlFor="allProducts"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      All Products
                    </label>
                    <select
                      id="allProducts"
                      name="selectedProducts"
                      multiple
                      value={addOfferData.productsIncluded}
                      onChange={handleChange}
                      className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      {products.map((product) => (
                        <option
                          key={product._id}
                          value={product._id}
                          className={`${
                            addOfferData.selectedProducts.includes(product._id)
                              ? "bg-blue-100 text-black" 
                              : ""
                          }`}
                        >
                          {product.productName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {addOfferData.associatedFor === "category" && (
                  <div>
                    <label
                      htmlFor="categories"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Categories
                    </label>
                    <select
                      id="categories"
                      name="selectedCategories"
                      multiple
                      value={addOfferData.selectedCategories}
                      onChange={handleChange}
                      className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="offerPrice"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Offer Price
                  </label>
                  <input
                    type="number"
                    id="offerPrice"
                    value={addOfferData.offerPrice}
                    onChange={handleChange}
                    name="offerPrice"
                    placeholder="₹2000"
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={
                      addOfferData.endDate
                        ? addOfferData.endDate.split("T")[0]
                        : ""
                    }
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    name="endDate"
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    <input
                      type="checkbox"
                      name="isActive"
                      value={addOfferData.isActive}
                      onChange={handleChange}
                      id="isActive"
                      checked={addOfferData.isActive}
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  className="text-gray-500 bg-transparent hover:bg-gray-200 rounded-lg px-5 py-2.5 text-sm dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={toggleEditModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-green-600 hover:bg-green-700 rounded-lg px-5 py-2.5 text-sm dark:bg-green-600 dark:hover:bg-green-700"
                >
                  Update Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Option Modal */}
      {isOptionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          onClick={toggleOptionModal}
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700 h-[30vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                More Options
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={toggleOptionModal}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.293l5.646-5.647a.5.5 0 0 1 .708.708L10.707 9l5.647 5.646a.5.5 0 0 1-.708.708L10 9.707l-5.646 5.647a.5.5 0 0 1-.708-.708L9.293 9 3.646 3.354a.5.5 0 0 1 .708-.708L10 8.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="flex justify-center items-center gap-10 h-[15vh]">
              <button className="btn" onClick={toggleEditModal}>
                Edit Offer
              </button>
              <button
                className="btn bg-red-500 text-white hover:bg-red-700"
                onClick={() => handleDeleteOffer(offerId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManagement;
