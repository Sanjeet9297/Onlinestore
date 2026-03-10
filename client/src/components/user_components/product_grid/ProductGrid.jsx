import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { addToBag } from "../../../api/bag";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { clearOffers, setOffer } from "../../../features/offers/OfferSlice";
import { addToBagQty } from "../../../features/bag/BagSlice";

const ProductGrid = ({ products, loading, offers }) => {
  const { uid } = useSelector((state) => state.user);
  const { bags } = useSelector((state) => state.bag);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [disableBtnState, setDisableBtnState] = useState({});

  useEffect(() => {
    if (offers && offers.isActive) {
      offers.productsIncluded.forEach((productId) => {
        dispatch(
          setOffer({
            productId,
            discount: offers.offerPrice,
          })
        );
      });
    } else {
      dispatch(clearOffers());
    }
  }, [dispatch, offers]);

  const handleCardClick = (productID) => {
    navigate(`/products/${productID}`);
  };

  // Check if a product is already in the bag
  const isProductInBag = (productId) => {
    return bags[uid]?.quantities?.hasOwnProperty(productId);
  };

  // Add to bag function
  const handleAddToBag = async (productId) => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
      return;
    }

    setDisableBtnState((prevState) => ({
      ...prevState,
      [productId]: true,
    }));

    // Find the product and its stock
    const productIndex = products.findIndex(
      (product) => product._id === productId
    );
    const product = products[productIndex];

    if (product.stock <= 0) {
      // Re-enable the button if the product is out of stock
      setDisableBtnState((prevState) => ({
        ...prevState,
        [productId]: false,
      }));
      return toast.warning("Product Out Of Stock");
    }

    const data = {
      userId: uid,
      productId,
    };

    try {
      await addToBag(data);
      dispatch(addToBagQty({ userId: uid, productId }));
      toast.success("Product added to bag");
    } catch (error) {
      console.error("Error adding to bag:", error);
      toast.error("Failed to add product to bag");
      // Re-enable the button in case of failure
      setDisableBtnState((prevState) => ({
        ...prevState,
        [productId]: false,
      }));
    }
  };

  // Function to calculate the discounted price
  const getDiscountedPrice = (price, discount) => {
    return price - discount;
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {loading ? (
            <div className="w-[50vw] h-[50vh] flex justify-center items-center">
              <span className="loading loading-spinner loading-lg text-black"></span>
            </div>
          ) : (
            products
              .filter((product) => !product.isDeleted)
              .map((product) => {
                // Checking product has an active offer
                const isOnOffer =
                  offers?.productsIncluded?.includes(product._id) ?? false;
                const discount = isOnOffer ? offers.offerPrice : 0;
                const discountedPrice = isOnOffer
                  ? getDiscountedPrice(product.price, discount)
                  : product.price;

                return (
                  <div
                    key={product._id}
                    className="group cursor-pointer transition duration-500 ease-in-out hover:translate-y-[-10px] relative"
                  >
                    <div onClick={() => handleCardClick(product._id)}>
                      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                        <img
                          src={
                            product.images &&
                            product.images.length > 0 &&
                            product.images[0]?.url
                              ? product.images[0].url
                              : "https://via.placeholder.com/150?text=No+Image"
                          }
                          alt={product.productName}
                          className="h-full w-full object-cover object-center group-hover:opacity-75"
                        />
                      </div>
                      <h3 className="mt-4 text-sm text-gray-700">
                        {product.productName}
                      </h3>

                      {/* Display price with discount */}
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {isOnOffer ? (
                          <span className="text-black">
                            ₹{discountedPrice.toFixed(0)}
                          </span>
                        ) : (
                          `₹${product.price}`
                        )}
                        {isOnOffer && (
                          <span className="ml-2 text-sm line-through text-gray-500">
                            ₹{product.price}
                          </span>
                        )}
                      </p>
                    </div>

                    <div
                      className="btn w-fit bg-black text-white p-3 text-xl absolute right-0 cursor-pointer transition duration-500 ease-in-out opacity-0 group-hover:opacity-100 group-hover:translate-y-[-20px] hover:scale-90 rounded-md"
                      onClick={() => handleAddToBag(product._id)}
                      disabled={
                        isProductInBag(product._id) ||
                        disableBtnState[product._id]
                      }
                    >
                      <HiOutlineShoppingBag />
                    </div>
                  </div>
                );
              })
          )}
          {!loading && products?.length === 0 && (
            <div className="flex justify-center w-full absolute">
              <h1 className="text-gray-500">No products found!</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
