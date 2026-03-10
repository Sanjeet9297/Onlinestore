import { useEffect, useState } from "react";
import { fetchWishlist, removeProduct } from "../../../api/wishlist";
import Navbar from "../../../components/user_components/navbar/Navbar";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToBag } from "../../../api/bag";
import { useNavigate } from "react-router-dom";
import { RiDeleteBinLine } from "react-icons/ri";
import { addToBagQty } from "../../../features/bag/BagSlice";

const Wishlist = () => {
  const { uid } = useSelector((state) => state.user);

  const offers = useSelector((state) => state.offers);
  const { bags } = useSelector((state) => state.bag);
  const dispatch = useDispatch();

  const [disableBtnState, setDisableBtnState] = useState({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getWishlist = async () => {
      setLoading(true);
      try {
        const { wishlistItems } = await fetchWishlist(uid);
        setProducts(wishlistItems.filter((item) => !item.isDeleted).reverse());
      } catch (error) {
        console.error("Error fetching Wishlist items:", error);
      } finally {
        setLoading(false);
      }
    };
    if (uid) {
      getWishlist();
    }
  }, [uid]);

  const navigate = useNavigate();

  //navigating to single product page
  const handleCardClick = (productID) => {
    navigate(`/wishlist/${productID}`);
  };


  // Check if a product is already in the bag
  const isProductInBag = (productId) => {
    return bags[uid]?.quantities?.hasOwnProperty(productId);
  };

  //add to bag
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
    const productIndex = products.findIndex((product) => product.productId === productId);
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
      dispatch(addToBagQty({userId: uid, productId}));
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


  //Remove Product from wishlist
  const handleRemoveProduct = async (productId) => {
    try {
      await removeProduct(uid, productId);

      setProducts((prev) =>
        prev.filter((product) => product.productId !== productId)
      );
    } catch (error) {
      console.error("Failed to remove product from wishlist", error);
    }
  };

  // Calculate discounted price
  const getDiscountedPrice = (price, discount) => {

    return price - discount;
  };

  return (
    <div className="min-h-screen h-auto">
      <Navbar />
      <div className="relative mx-auto max-w-2xl px-8 py-14 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-20">
        {products?.length !== 0 && (
          <h2 className="absolute top-[40px] font-bold text-2xl">Wishlist</h2>
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {loading ? (
            <div className="w-[80vw] h-[50vh] flex justify-center items-center">
              <span className="loading loading-spinner loading-lg text-black"></span>
            </div>
          ) : products && products.length === 0 ? (
            <div className="w-[80vw] h-[50vh] font-bold flex justify-center items-center">
              <h1 className="text-2xl">Your Wishlist Is Empty!</h1>
            </div>
          ) : (
            products.map((product) => {
              const isOnOffer = offers && offers.hasOwnProperty(product.productId);
              const discount = isOnOffer ? offers[product.productId].discount : 0;
              const discountedPrice = isOnOffer
                ? getDiscountedPrice(product.price, discount)
                : product.price;

              return (
                <div
                  key={product.productId}
                  className="group cursor-pointer transition duration-500 ease-in-out hover:translate-y-[-10px] relative"
                >
                  <div onClick={() => handleCardClick(product.productId)}>
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                      <img
                        src={product.productImage?.url}
                        alt={product.productName}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                      />
                    </div>
                    <h3 className="mt-4 text-sm text-gray-700">
                      {product.productName}
                    </h3>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {isOnOffer ? (
                        <>
                          ₹{discountedPrice.toFixed(0)}{" "}
                          <span className="text-lg line-through text-gray-500">
                            ₹{product.price}
                          </span>
                        </>
                      ) : (
                        `₹${product.price}`
                      )}
                    </p>
                  </div>

                  {/* Wishlist remove button */}
                  <div
                    className="btn w-fit bg-black text-white p-3 text-xl absolute right-12 cursor-pointer transition duration-500 ease-in-out opacity-0 group-hover:opacity-100 group-hover:translate-y-[-20px] hover:scale-90 rounded-md"
                    onClick={() => handleRemoveProduct(product.productId)}
                  >
                    <RiDeleteBinLine />
                  </div>
                  <div
                    className="btn w-fit bg-black text-white p-3 text-xl absolute right-0 cursor-pointer transition duration-500 delay-150 ease-in-out opacity-0 group-hover:opacity-100 group-hover:translate-y-[-20px] hover:scale-90 rounded-md"
                    onClick={() => handleAddToBag(product.productId)}
                    disabled={isProductInBag(product.productId) || disableBtnState[product.productId]}
                  >
                    <HiOutlineShoppingBag />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
