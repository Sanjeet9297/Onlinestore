import React, { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { updateQuantity } from "../../../features/bag/BagSlice";
import { addToWishlist } from "../../../api/wishlist";

const BagSection = ({
  img,
  name,
  category,
  managePrice,
  qty,
  stock,
  productId,
  removeProduct,
  onQuantityChange,
}) => {
  const userId = useSelector((state) => state.user.uid);

  // Fetching discount from Redux for the current product ID
  const productOffer = useSelector((state) => state.offers[productId]);
  const discount = productOffer ? productOffer.discount : 0;

  const quantities = useSelector(
    (state) => state.bag.bags[userId]?.quantities[productId]
  );

  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(quantities || qty);
  const [maxStock, setMaxStock] = useState(10);
  const [price, setPrice] = useState(managePrice * quantity);

  useEffect(() => {
    if (stock >= 10) {
      setMaxStock(10);
    } else if (stock > 5 && stock <= 9) {
      setMaxStock(3);
    } else {
      setMaxStock(1);
    }
  }, [stock]);

  //use effect for dispatching and storing quantity info in redux
  useEffect(() => {
    dispatch(updateQuantity({ userId, productId, quantity }));

    setPrice(quantity * managePrice);
  }, [dispatch, productId, quantity]);

  const handleQuantityInc = () => {
    setQuantity(quantity + 1);
    if (qty < stock) {
      onQuantityChange(productId, qty + 1);
    }
  };

  const handleQuantityDec = () => {
    setQuantity(quantity - 1);
    if (qty > 1) {
      onQuantityChange(productId, qty - 1);
    }
  };

  //remove product from bag
  const handleDeleteFromBag = async () => {
    removeProduct(productId);
  };

  //Adding product to wishlist from bag
  const handleAddToWishlist = async () => {
    const data = {
      userId,
      productId,
    };
    await addToWishlist(data);
  };

  // Calculate discounted price
  const getDiscountedPrice = (price) => {
    return price - discount;
  };

  return (
    <div>
      <div className=" w-[720px] flex justify-between items-start py-3 border-b border-gray-400">
        <div className="flex flex-col gap-5">
          <img
            src={img}
            className="w-[150px] h-auto"
          />

          <div className="flex justify-between">
            <div className="flex items-center">
              <div class="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-black bg-white border border-black border-r-0 rounded-s-full hover:bg-gray-300 hover:rounded-e-full"
                  disabled={quantity === 1}
                  onClick={handleQuantityDec}
                >
                  -
                </button>
                <h1
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900"
                >
                  {quantity}
                </h1>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-black bg-white border border-black border-l-0 rounded-e-full hover:bg-gray-300 hover:rounded-s-full"
                  disabled={quantity >= maxStock}
                  onClick={handleQuantityInc}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <button
                className="btn ml-3 text-sm font-medium text-black bg-white border border-black rounded-full hover:bg-gray-300"
                onClick={handleAddToWishlist}
              >
                <FiHeart />
              </button>
            </div>
          </div>
        </div>
        <div className="relative right-24">
          <h1 className="w-[190px]">{name}</h1>
          <h2 className="text-gray-500">{category}</h2>
          {/* <h2 className="text-gray-500">Normal Variant</h2>
          <h2>
            Size<span className="underline ml-2">7</span>
          </h2> */}
          <h2>{discount > 0 ? (
              <>Offer Price : ₹{getDiscountedPrice(managePrice).toFixed(0)}</>
            ) : (
              <>
                MRP : ₹ <span>{managePrice}</span>
              </>
            )}</h2>
        </div>
        <div className="flex">
          <h1>
            {discount > 0 ? (
              <>Sub : ₹{getDiscountedPrice(price).toFixed(0)}</>
            ) : (
              <>
                Sub : ₹ <span>{price}</span>
              </>
            )}
          </h1>
          <button
            className="ml-3 mb-3 px-3 py-3 text-sm font-medium text-black bg-white border border-black rounded-full hover:bg-gray-300"
            onClick={handleDeleteFromBag}
          >
            <RiDeleteBinLine />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BagSection;
