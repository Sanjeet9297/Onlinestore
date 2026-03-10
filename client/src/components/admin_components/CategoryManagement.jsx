import React, { useEffect, useState } from "react";
import {
  addCategory,
  fetchCategories,
  editCategory,
  toggleCategoryStatus,
} from "../../api/category";
import { toast } from "react-toastify";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [categoryName, setCategoryName] = useState("");
const [categoryDescription, setCategoryDescription] = useState("");
const [categoryID, setCategoryID] = useState(null);

const [searchQuery, setSearchQuery] = useState("");
const [filteredCategories, setFilteredCategories] = useState([]);

// Add a state to trigger rerenders
const [rerender, setRerender] = useState(false);

useEffect(() => {
  const getCategories = async () => {
    try {
      const { data } = await fetchCategories();
      if (data) {
        setCategories(data);
        setFilteredCategories(data);
      } else {
        console.log("No data found");
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };
  getCategories();
}, [rerender]); // Add rerender as a dependency

const toggleModal = () => {
  setIsModalOpen(!isModalOpen);
  if (isModalOpen) {
    setCategoryName("");
    setCategoryDescription("");
  }
};

const toggleEditModal = (ID) => {
  setIsEditModalOpen(!isEditModalOpen);
  setCategoryID(ID);

  if (!isEditModalOpen) {
    const categoryToEdit = categories.find((category) => category._id === ID);
    setCategoryName(categoryToEdit.name);
    setCategoryDescription(categoryToEdit.description);
  } else {
    // Reset inputs when closing the edit modal
    setCategoryName("");
    setCategoryDescription("");
  }
};

// Add new category
const handleAddCategory = async (e) => {
  e.preventDefault();

  const normalizeString = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const normalizedCategoryName = normalizeString(categoryName);

  const categoryExists = categories.some(
    (category) => normalizeString(category.name) === normalizedCategoryName
  );

  if (categoryExists) {
    toast.error("Category name already exists.");
    return;
  }

  const categoryData = {
    name: categoryName,
    description: categoryDescription,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  };

  try {
    const { newCategory } = await addCategory(categoryData);
    if (newCategory) {
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      setRerender((prev) => !prev); // Trigger rerender
      toast.success("Added new category");
    } else {
      toast.error("Failed to add category");
    }
    toggleModal();
  } catch (error) {
    console.error("Error adding category", error);
  }
};

// Edit category
const handleEditCategory = async (e) => {
  e.preventDefault();

  const normalizeString = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const normalizedCategoryName = normalizeString(categoryName);

  const categoryExists = categories.some(
    (category) => normalizeString(category.name) === normalizedCategoryName
  );

  if (categoryExists) {
    toast.error("Category name already exists.");
    return;
  }

  const categoryData = {
    name: categoryName,
    description: categoryDescription,
    updatedAt: new Date().toISOString(),
  };

  try {
    const updatedCategory = await editCategory(categoryID, categoryData);
    if (updatedCategory) {
      toast.success("Edited Category");
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === categoryID ? updatedCategory : category
        )
      );
      setRerender((prev) => !prev); // Trigger rerender
    } else {
      toast.error("Failed to update category");
    }
    toggleEditModal(categoryID);
  } catch (error) {
    console.error("Error editing category", error);
  }
};

// Toggle category status (e.g., delete/restore)
const toggleCategory = async (ID) => {
  try {
    const { updatedCategory } = await toggleCategoryStatus(ID);
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category._id === ID ? updatedCategory : category
      )
    );
    setRerender((prev) => !prev); // Trigger rerender
  } catch (error) {
    console.error("Error toggling category status", error);
  }
};

// Handle search query
const handleSearch = (e) => {
  const query = e.target.value;
  setSearchQuery(query);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(normalizedQuery) ||
      (category.description &&
        category.description.toLowerCase().includes(normalizedQuery))
  );

  setFilteredCategories(filtered);
};

  return (
    <div>
      <div className="absolute top-14 right-0 w-[1110px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-gray-800 dark:bg-gray-900">
            <h1 className="text-white text-2xl">Category</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  id="table-search-users"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search for category"
                />
              </div>
              <button
                onClick={toggleModal}
                className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg"
              >
                Add Category
              </button>
            </div>
          </div>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-white uppercase bg-gray-100 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Category
                </th>
                <th scope="col" className="px-6 py-3">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3">
                  Updated At
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Edit
                </th>
                <th scope="col" className="px-6 py-3">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div className="text-base font-semibold">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description || "No description available"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            category.isDeleted ? "bg-red-500" : "bg-green-500"
                          } me-2`}
                        ></div>
                        {category.isDeleted ? "Inactive" : "Active"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        onClick={() => toggleEditModal(category._id)}
                        className="font-medium text-green-600 dark:text-green-400 cursor-pointer hover:underline"
                      >
                        Edit
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        onClick={() => toggleCategory(category._id)}
                        className={`font-medium ${
                          category.isDeleted ? "text-green-400" : "text-red-400"
                        } cursor-pointer hover:underline`}
                      >
                        {category.isDeleted ? "Recover" : "Delete"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          onClick={toggleModal}
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Category
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
            <form onSubmit={handleAddCategory}>
              <div className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="categoryDescription"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="categoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
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
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          onClick={() => toggleEditModal(categoryID)} // Pass categoryID to toggleEditModal
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Category
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => toggleEditModal(categoryID)}
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
            <form onSubmit={handleEditCategory}>
              <div className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="editCategoryName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="editCategoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editCategoryDescription"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="editCategoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  className="text-gray-500 bg-transparent hover:bg-gray-200 rounded-lg px-5 py-2.5 text-sm dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => toggleEditModal(categoryID)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5 text-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
