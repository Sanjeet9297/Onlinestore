import { useEffect, useState } from "react";
import {
  addProduct,
  editProduct,
  fetchProductsLimit,
  toggleProductState,
  uploadImageToStorage,
} from "../../api/product";
import { fetchCategories } from "../../api/category";
import { toast } from "react-toastify";
import Pagination from "../user_components/pagination/Pagination";
import useDebounce from "../../hooks/useDebounce";
import { searchProducts } from "../../api/admin";

const ProductManagement = () => {
  const wordLength = 3;
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const [totalProducts, setTotalProducts] = useState(0);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Edit product images
  const [previewImages, setPreviewImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [productID, setProductID] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVariantModalOpen, setVariantIsModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isChanged, setIsChanged] = useState(false);
  const [addProductData, setAddProductData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    sizes: [],
    newArrival: false,
    images: [],
  });

  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Function to reset the form data
  const resetForm = () => {
    setAddProductData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      sizes: [],
      newArrival: false,
      images: [],
    });
    setSelectedImages([]);
    setPreviewImages([]);
  };

  // Edit image preview function
  const handlePreviewChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[index] = reader.result; // Base64 for preview
          return updatedImages;
        });
      };
      reader.readAsDataURL(file); // Converts file to Base64 for preview
    }
  };

  // Fetch products or search results
  const getProducts = async () => {
    try {
      setLoading(true);
      const response = debouncedSearchQuery
        ? await searchProducts(debouncedSearchQuery, currentPage, entriesPerPage)
        : await fetchProductsLimit(currentPage, entriesPerPage);
      if (response.products) {
        setProducts(response.products);
        setFilteredProducts(response.products); // Use backend results directly
        setTotalProducts(response.totalProducts);
      } else {
        console.log("No data found");
        setProducts([]);
        setFilteredProducts([]);
        setTotalProducts(0);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
      setProducts([]);
      setFilteredProducts([]);
      setTotalProducts(0);
    }
  };

  // Fetching products
  useEffect(() => {
    getProducts();
  }, [isChanged, currentPage, debouncedSearchQuery]);

  // Fetching categories
  useEffect(() => {
    const getCategories = async () => {
      const { data } = await fetchCategories();
      setCategories(data.filter((category) => !category.isDeleted));
    };
    getCategories();
  }, []);

  // Search Handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Function to toggle add Product modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) resetForm();
  };

  // Function to toggle add variant modal
  const toggleVariantModal = () => {
    setVariantIsModalOpen(!isVariantModalOpen);
  };

  // Function to toggle edit modal
  const toggleEditModal = (id) => {
    setEditModalOpen(!isEditModalOpen);
    setProductID(id);

    if (!isEditModalOpen) {
      const productToEdit = products.find((product) => product._id === id);
      setAddProductData({
        name: productToEdit.productName,
        description: productToEdit.description,
        price: productToEdit.price,
        stock: productToEdit.stock,
        category: productToEdit.category,
        brand: productToEdit.brand,
        sizes: productToEdit.sizes || [],
        newArrival: productToEdit.newArrival || false,
        images: productToEdit.images,
      });
      setPreviewImages(
        productToEdit.images.map((img) => (typeof img === "string" ? img : img.url))
      );
    } else {
      resetForm();
    }
  };

  // Size changes
  const handleSizeChange = (event) => {
    const { value, checked } = event.target;
    const newSize = { name: value, inStock: checked };

    setAddProductData((prevState) => {
      const sizeExists = prevState.sizes.some((size) => size.name === value);

      if (checked && !sizeExists) {
        return {
          ...prevState,
          sizes: [...prevState.sizes, newSize],
        };
      } else if (!checked) {
        return {
          ...prevState,
          sizes: prevState.sizes.filter((size) => size.name !== value),
        };
      }
      return prevState;
    });
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === "checkbox") {
      setAddProductData((prevData) => ({ ...prevData, [name]: checked }));
    } else {
      setAddProductData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Function to handle image selection
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files); // Convert file list to an array

    if (selectedImages.length + files.length > 5) {
      toast.error("You can only select up to 5 images.");
      return;
    }

    setSelectedImages(files);
  };

  // Function to remove an image from preview
  const removeImage = (indexToRemove) => {
    setSelectedImages((prevImages) => {
      const newImages = prevImages.filter((_, index) => index !== indexToRemove);

      // Update addProductData.images as well
      setAddProductData((prevData) => ({
        ...prevData,
        images: newImages,
      }));

      return newImages;
    });
  };

  // Add product validate
  const validate = () => {
    if (addProductData.name.trim() === "") {
      toast.error("Give Proper Product Name");
      return false;
    } else if (
      products.some((product) => product.productName === addProductData.name)
    ) {
      toast.error("Product Name already exists!");
      return false;
    }
    if (addProductData.price <= 500) {
      toast.error("Price should be greater than 500");
      return false;
    } else if (addProductData.stock <= 0) {
      toast.error("Invalid stock");
      return false;
    }
    return true;
  };

  // Edit product validate
  const editValidate = () => {
    if (addProductData.name.trim() === "") {
      toast.error("Give Proper Product Name");
      return false;
    }
    if (addProductData.price <= 500) {
      toast.error("Price should be greater than 500");
      return false;
    } else if (addProductData.stock <= 0) {
      toast.error("Invalid stock");
      return false;
    }
    return true;
  };

  // Adding Product
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", addProductData.name);
    formData.append("description", addProductData.description);
    formData.append("price", addProductData.price);
    formData.append("stock", addProductData.stock);
    formData.append("category", addProductData.category);
    formData.append("brand", addProductData.brand);
    formData.append("sizes", JSON.stringify(addProductData.sizes));
    formData.append("newArrival", addProductData.newArrival);

    selectedImages.forEach((image) => {
      formData.append("images", image);
    });

    if (validate()) {
      if (selectedImages.length < 3 || selectedImages.length > 5) {
        toast.error("Minimum 3 images, Maximum 5 images");
        setLoading(false);
        return false;
      }
      try {
        await addProduct(formData);
        setLoading(false);
        resetForm();
        toggleModal();
        setIsChanged(!isChanged);
      } catch (error) {
        console.log("Error while adding product", error);
        setLoading(false);
      }
    } else setLoading(false);
  };

  const dataURLtoFile = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "image.jpg", { type: mime });
  };

  // Edit Product
  const handleEditProductSubmit = async (e) => {
    e.preventDefault();

    if (editValidate()) {
      try {
        const updatedImages = [];

        for (let i = 0; i < previewImages.length; i++) {
          const img = previewImages[i];
          if (img.startsWith("data:image/")) {
            const file = dataURLtoFile(img);
            const oldImage = i < addProductData.images.length ? addProductData.images[i] : null;
            const oldPublicId = oldImage ? oldImage.public_id : null;
            const uploadedImage = await uploadImageToStorage(file, null, oldPublicId);
            updatedImages.push(uploadedImage);
          } else {
            const existingImage = addProductData.images.find(
              (image) => image.url === img || image === img
            ) || { url: img, public_id: "" };
            updatedImages.push(existingImage);
          }
        }

        const updatedProductData = {
          ...addProductData,
          images: updatedImages,
          productName: addProductData.name,
        };
        delete updatedProductData.name;

        await editProduct(productID, updatedProductData);
        resetForm();
        toggleEditModal();
        setIsChanged(!isChanged);
        toast.success("Product updated successfully");
      } catch (error) {
        console.error("Error editing product:", error);
        toast.error("Error updating product");
      }
    }
  };

  // Delete Product
  const handleProductDelete = async (productID) => {
    const { updatedProduct } = await toggleProductState(productID);
    setProducts((prev) => [...prev, updatedProduct]);
    setIsChanged(!isChanged);
  };

  return (
    <div>
      <div className="absolute top-14 right-0 w-[1110px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
            <h1 className="text-white text-2xl">Products</h1>
            <label htmlFor="table-search" className="sr-only">
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
                value={searchQuery}
                onChange={handleSearch}
                className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search for products"
              />
            </div>
            <button
              className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg"
              onClick={toggleModal}
            >
              Add Product
            </button>
          </div>

          {/* Table */}
          <h1 className="text-white ml-5">Total Products : {totalProducts}</h1>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Product Details
                </th>
                <th scope="col" className="px-6 py-3">
                  Category
                </th>
                <th scope="col" className="px-6 py-3">
                  Brand
                </th>
                <th scope="col" className="px-6 py-3">
                  Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Stock
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
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <span className="mx-auto">Loading...</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    key={product._id}
                  >
                    <th
                      scope="row"
                      className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <img
                        className="w-10 h-10 rounded-full"
                        src={
                          product.images.length > 0
                            ? typeof product.images[0] === "string"
                              ? product.images[0]
                              : product.images[0].url
                            : ""
                        }
                        alt={product.productName}
                      />
                      <div className="ps-3">
                        <div className="text-base font-semibold">
                          <h1>
                            {product.productName.length > wordLength
                              ? `${product.productName
                                  .split(" ")
                                  .slice(0, wordLength)
                                  .join(" ")}...`
                              : product.productName}
                          </h1>
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      {categories.find(
                        (category) => category._id === product.category
                      )?.name || "-"}
                    </td>
                    <td className="px-6 py-4">{product.brand}</td>
                    <td className="px-6 py-4">{product.price}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            product.isDeleted ? "bg-red-500" : "bg-green-500"
                          } me-2`}
                        ></div>
                        {product.isDeleted ? "Unpublished" : "Published"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="font-medium text-green-600 dark:text-green-600 cursor-pointer hover:underline"
                        onClick={() => toggleEditModal(product._id)}
                      >
                        Edit
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          product.isDeleted ? "text-green-600" : "text-red-500"
                        } cursor-pointer hover:underline`}
                        onClick={() => handleProductDelete(product._id)}
                      >
                        {product.isDeleted ? "Recover" : "Unpublish"}
                      </span>
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
            totalEntries={totalProducts}
            entriesPerPage={entriesPerPage}
          />

          {/* Add Product Modal */}
          {isModalOpen && (
            <div
              id="crud-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
            >
              <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto max-h-[80vh]">
                  <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Create New Product
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={toggleModal}
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
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  {/* Modal body */}
                  <form className="p-4 md:p-5" onSubmit={handleAddProductSubmit}>
                    <div className="grid gap-4 mb-4 grid-cols-2">
                      <div className="col-span-2">
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={addProductData.name}
                          onChange={handleChange}
                          id="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Type product name"
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="description"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          value={addProductData.description}
                          onChange={handleChange}
                          rows="3"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Add a short description"
                          required
                        ></textarea>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="price"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={addProductData.price}
                          onChange={handleChange}
                          id="price"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="₹2999"
                          required
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="stock"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          id="stock"
                          value={addProductData.stock}
                          onChange={handleChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter stock"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="category"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Category
                        </label>
                        <select
                          name="category"
                          value={addProductData.category}
                          onChange={handleChange}
                          id="category"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="brand"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={addProductData.brand}
                          onChange={handleChange}
                          id="brand"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter product Brand"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="flex items-center mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          <input
                            type="checkbox"
                            name="newArrival"
                            checked={addProductData.newArrival}
                            onChange={handleChange}
                            id="newArrival"
                            className="mr-2"
                          />
                          New Arrival
                        </label>
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="images"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Upload Images
                        </label>
                        <input
                          type="file"
                          name="images"
                          id="images"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        />
                        {/* Preview images */}
                        {selectedImages.length >= 5 ? (
                          <h1 className="text-red-300">Only 5 Images Are Allowed</h1>
                        ) : (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {selectedImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(image)} // Create a preview URL for the image
                                  alt="Preview"
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                >
                                  X
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn bg-blue-700 text-white hover:bg-blue-800 w-full px-4 py-2 rounded-lg"
                    >
                      {loading ? "Adding Product..." : "Add Product"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {isEditModalOpen && (
            <div
              id="crud-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
            >
              <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto max-h-[80vh]">
                  <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Edit Product
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={toggleEditModal}
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
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  {/* Modal body */}
                  <form className="p-4 md:p-5" onSubmit={handleEditProductSubmit}>
                    <div className="grid gap-4 mb-4 grid-cols-2">
                      <div className="col-span-2">
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={addProductData.name}
                          onChange={handleChange}
                          id="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Type product name"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="description"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          value={addProductData.description}
                          onChange={handleChange}
                          rows="3"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Add a short description"
                          required
                        ></textarea>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="price"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={addProductData.price}
                          onChange={handleChange}
                          id="price"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="₹2999"
                          required
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="stock"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          id="stock"
                          value={addProductData.stock}
                          onChange={handleChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter stock"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="category"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Category
                        </label>
                        <select
                          name="category"
                          value={addProductData.category}
                          onChange={handleChange}
                          id="category"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="brand"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={addProductData.brand}
                          onChange={handleChange}
                          id="brand"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter product Brand"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="flex items-center mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          <input
                            type="checkbox"
                            name="newArrival"
                            checked={addProductData.newArrival}
                            onChange={handleChange}
                            id="newArrival"
                            className="mr-2"
                          />
                          New Arrival
                        </label>
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="images"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Upload Images
                        </label>
                        <div className="flex flex-col gap-3">
                          {previewImages.map((img, index) => (
                            <div key={index}>
                              <input
                                type="file"
                                name={`image${index}`}
                                id={`image${index}`}
                                onChange={(e) => handlePreviewChange(e, index)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              />
                              {/* Preview images */}
                              {img && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <div className="relative">
                                    <img
                                      src={img}
                                      alt="Preview"
                                      className="w-20 h-20 object-cover rounded-md"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn w-full bg-green-500 text-black hover:bg-green-800 px-4 py-2 rounded-lg"
                    >
                      {loading ? "Updating Product..." : "Update Product"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;