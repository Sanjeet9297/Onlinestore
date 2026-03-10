import { useEffect, useState } from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import BreadCrumb from "../../../components/user_components/breadcrumb/BreadCrumb";
import Footer from "../../../components/user_components/footer/Footer";
import { StarIcon } from "@heroicons/react/20/solid";
import { Radio, RadioGroup } from "@headlessui/react";
import ReviewSection from "../../../components/user_components/review_section/ReviewSection";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../../../api/product";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useDispatch, useSelector } from "react-redux";
import { addToBag } from "../../../api/bag";
import { toast } from "react-toastify";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { addToWishlist, fetchWishlist } from "../../../api/wishlist";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { addToBagQty } from "../../../features/bag/BagSlice";
import ReviewForm from "../../../components/user_components/review_form/ReviewForm";

// const product = {
//   name: "Basic Tee 6-Pack",
//   price: "$192",
//   href: "#",
//   breadcrumbs: [
//     { id: 1, name: "Men", href: "#" },
//     { id: 2, name: "Clothing", href: "#" },
//   ],
//   images: [
//     {
//       src: "https://tailwindui.com/plus/img/ecommerce-images/product-page-02-secondary-product-shot.jpg",
//       alt: "Two each of gray, white, and black shirts laying flat.",
//     },
//     {
//       src: "https://tailwindui.com/plus/img/ecommerce-images/product-page-02-tertiary-product-shot-01.jpg",
//       alt: "Model wearing plain black basic tee.",
//     },
//     {
//       src: "https://tailwindui.com/plus/img/ecommerce-images/product-page-02-tertiary-product-shot-02.jpg",
//       alt: "Model wearing plain gray basic tee.",
//     },
//     {
//       src: "https://tailwindui.com/plus/img/ecommerce-images/product-page-02-featured-product-shot.jpg",
//       alt: "Model wearing plain white basic tee.",
//     },
//   ],
//   colors: [
//     { name: "White", class: "bg-white", selectedClass: "ring-gray-400" },
//     { name: "Gray", class: "bg-gray-200", selectedClass: "ring-gray-400" },
//     { name: "Black", class: "bg-gray-900", selectedClass: "ring-gray-900" },
//   ],
//   sizes: [
//     { name: "XXS", inStock: false },
//     { name: "XS", inStock: true },
//     { name: "S", inStock: true },
//     { name: "M", inStock: true },
//     { name: "L", inStock: true },
//     { name: "XL", inStock: true },
//     { name: "2XL", inStock: true },
//     { name: "3XL", inStock: true },
//   ],
//   description:
//     'The Basic Tee 6-Pack allows you to fully express your vibrant personality with three grayscale options. Feeling adventurous? Put on a heather gray tee. Want to be a trendsetter? Try our exclusive colorway: "Black". Need to add an extra pop of color to your outfit? Our white tee has you covered.',
//   highlights: [
//     "Hand cut and sewn locally",
//     "Dyed with our proprietary colors",
//     "Pre-washed & pre-shrunk",
//     "Ultra-soft 100% cotton",
//   ],
//   details:
//     'The 6-Pack includes two black, two white, and two heather gray Basic Tees. Sign up for our subscription service and be the first to get new, exciting colors, like our upcoming "Charcoal Gray" limited release.',
// };
const reviews = { href: "#", average: 4, totalCount: 117 };

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SingleProductPage = () => {
  const { id } = useParams();

  const { uid } = useSelector((state) => state.user);
  // Fetching discount from Redux for the current product ID
  const productOffer = useSelector((state) => state.offers[id]);
  const discount = productOffer ? productOffer.discount : 0;

  const { bags } = useSelector((state) => state.bag);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [relatedProducts, setRelatedProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  //For rerendering the child after successfull review submit
  const [reviewsUpdated, setReviewsUpdated] = useState(false);
  const handleReviewSubmit = () => {
    setReviewsUpdated((prev) => !prev);
  };

  const [wishlistIcon, setWishlistIcon] = useState(<GoHeart />);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { singleProduct, relatedProductsData } = await getProduct(id);
        if (uid) {
          const { wishlistItems } = await fetchWishlist(uid);
          const exists = wishlistItems.some(
            (wishlist) => wishlist.productId === id
          );
          if (exists) setWishlistIcon(<GoHeartFill />);
        }
        //Only setting is Deleted false product
        if (!singleProduct.isDeleted) {
          setProduct(singleProduct);
        }
        setRelatedProduct(
          relatedProductsData.filter(
            (item) => item._id !== id && !item.isDeleted
          )
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  //For checking is product in bag or not
  const [isInBag, setIsInBag] = useState(false);

  useEffect(() => {
    // Check if the product is already in the bag
    if (bags[uid]?.quantities[product._id]) {
      setIsInBag(true);
    }
  }, [bags, product._id, uid]);

  //add to bag
  const handleAddToBag = async (e, productId) => {
    e.preventDefault();

    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
      return;
    }

    if (product.stock < 1) {
      return toast.warning("Product Out Of Stock");
    }

    const data = {
      userId: uid,
      productId,
    };

    try {
      // Call API to add product to bag
      await addToBag(data);
      dispatch(addToBagQty({ userId: uid, productId }));

      // Update the state and show a success toast
      setIsInBag(true);
      toast.success("Product added to bag");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add product to bag. Please try again.");
    }
  };

  useEffect(() => {
    if (product.sizes && product.sizes.length > 2) {
      setSelectedSize(product.sizes[2]);
    }
  }, []);

  // const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  //Adding product to wishlist
  const handleAddToWishlist = async (e, productId) => {
    e.preventDefault();

    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
      return;
    }

    const data = {
      userId: uid,
      productId,
    };
    const checkWishlist = await addToWishlist(data);
    if (checkWishlist) setWishlistIcon(<GoHeartFill />);
  };

  //related products card click
  const handleCardClick = (productID) => {
    navigate(`/products/${productID}`);
  };

  // Calculate discounted price
  const getDiscountedPrice = (price) => {
    return price - discount;
  };

  return (
    <div>
      <Navbar />
      <BreadCrumb />
      <div className="bg-white">
        <div className="pt-6">
          {/* Image gallery */}
          {loading ? (
            <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
              <div className="aspect-h-4 h-[455px] aspect-w-3 skeleton animate-pulse bg-gray-300 overflow-hidden rounded-lg lg:block"></div>

              <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
                <div className="aspect-h-2 aspect-w-3 h-[455px] skeleton animate-pulse bg-gray-300 overflow-hidden rounded-lg"></div>

                <div className="aspect-h-2 aspect-w-3 h-[455px] skeleton animate-pulse bg-gray-300 overflow-hidden rounded-lg"></div>
              </div>

              <div className="aspect-h-5 aspect-w-4 h-[455px] skeleton animate-pulse bg-gray-300 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg"></div>
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
              {product.images?.[0] && (
                <div className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block">
                  <Zoom>
                    <img
                      alt={product.productName}
                      src={product.images[0]?.url}
                      className="h-full w-full object-cover object-center"
                    />
                  </Zoom>
                </div>
              )}
              <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
                {product.images?.[1] && (
                  <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                    <Zoom>
                      <img
                        alt={product.productName}
                        src={product.images[1]?.url}
                        className="h-full w-full object-cover object-center"
                      />
                    </Zoom>
                  </div>
                )}
                {product.images?.[2] && (
                  <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg">
                    <Zoom>
                      <img
                        alt={product.productName}
                        src={product.images[2]?.url}
                        className="h-full w-full object-cover object-center"
                      />
                    </Zoom>
                  </div>
                )}
              </div>
              {product.images?.[3] && (
                <div className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg">
                  <Zoom>
                    <img
                      alt={product.productName}
                      src={product.images[3]?.url}
                      className="h-full w-full object-cover object-center"
                    />
                  </Zoom>
                </div>
              )}
            </div>
          )}

          {/* Product info */}
          <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
              {loading ? (
                <div className="skeleton animate-pulse bg-gray-300 w-500 h-4"></div>
              ) : (
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {product.productName}
                </h1>
              )}
            </div>

            {/* Options */}
            <div className="mt-4 lg:row-span-3 lg:mt-0">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                {loading ? (
                  <div className="skeleton animate-pulse bg-gray-300 w-[100px] h-7"></div>
                ) : discount ? (
                  <>
                    ₹{getDiscountedPrice(product.price).toFixed(0)}{" "}
                    <span className="text-lg line-through text-gray-500">
                      ₹{product.price}
                    </span>
                  </>
                ) : (
                  `₹${product.price}`
                )}
              </p>

              {/* Stock */}
              <p className="text-xl tracking-tight text-gray-900">
                {product.stock > 10 ? (
                  <h1 className="bg-green-400 w-fit px-2 rounded-md text-[14px] font-bold">
                    In Stock
                  </h1>
                ) : product.stock > 2 && product.stock <= 10 ? (
                  <h1 className="bg-yellow-400 w-fit px-2 rounded-md text-[14px] font-bold">
                    Few Left
                  </h1>
                ) : product.stock < 2 ? (
                  <h1 className="bg-red-400 w-fit px-2 rounded-md text-[14px] font-bold">
                    Out of Stock
                  </h1>
                ) : (
                  <h1 className="bg-orange-400 w-fit px-2 rounded-md text-[14px] font-bold">
                    Low Stock
                  </h1>
                )}
              </p>

              <p>{product.stock} items left</p>

              {/* Reviews */}
              <div className="mt-6">
                <h3 className="sr-only">Reviews</h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        aria-hidden="true"
                        className={classNames(
                          reviews.average > rating
                            ? "text-gray-900"
                            : "text-gray-200",
                          "h-5 w-5 flex-shrink-0"
                        )}
                      />
                    ))}
                  </div>
                  <p className="sr-only">{reviews.average} out of 5 stars</p>
                  <a
                    href={reviews.href}
                    className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {reviews.totalCount} reviews
                  </a>
                </div>
              </div>

              <form className="mt-10">
                {/* Colors */}
                <div>
                  {/* <h3 className="text-sm font-medium text-gray-900">Color</h3> */}

                  <fieldset aria-label="Choose a color" className="mt-4">
                    {/* <RadioGroup
                      value={selectedColor}
                      onChange={setSelectedColor}
                      className="flex items-center space-x-3"
                    >
                      {product.map((color) => (
                        <Radio
                          key={color.name}
                          value={color}
                          aria-label={color.name}
                          className={classNames(
                            color.selectedClass,
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none data-[checked]:ring-2 data-[focus]:data-[checked]:ring data-[focus]:data-[checked]:ring-offset-1"
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={classNames(
                              color.class,
                              "h-8 w-8 rounded-full border border-black border-opacity-10"
                            )}
                          />
                        </Radio>
                      ))}
                    </RadioGroup> */}
                  </fieldset>
                </div>

                {/* Sizes */}
                <div className="mt-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    <a
                      href="#"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Size guide
                    </a>
                  </div>

                  <fieldset aria-label="Choose a size" className="mt-4">
                    <RadioGroup
                      value={selectedSize}
                      onChange={setSelectedSize}
                      className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4"
                    >
                      {product?.sizes?.length > 0 ? (
                        product.sizes.map((size) => (
                          <Radio
                            key={size.name}
                            value={size.name}
                            disabled={!size.inStock}
                            className={classNames(
                              size.inStock
                                ? "cursor-pointer bg-white text-gray-900 shadow-sm"
                                : "cursor-not-allowed bg-gray-50 text-gray-200",
                              "group relative flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none"
                            )}
                          >
                            <span>{size.name}</span>
                            {size.inStock ? (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-px rounded-md border-2 border-transparent group-focus:border group-checked:border-indigo-500"
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                              >
                                <svg
                                  stroke="currentColor"
                                  viewBox="0 0 100 100"
                                  preserveAspectRatio="none"
                                  className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                                >
                                  <line
                                    x1={0}
                                    x2={100}
                                    y1={100}
                                    y2={0}
                                    vectorEffect="non-scaling-stroke"
                                  />
                                </svg>
                              </span>
                            )}
                          </Radio>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No sizes available
                        </p>
                      )}
                    </RadioGroup>
                  </fieldset>
                </div>

                <div className="flex gap-5">
                  <button
                    type="submit"
                    onClick={(e) => handleAddToBag(e, product._id)}
                    className={`mt-10 flex w-full items-center justify-center rounded-md border border-transparent ${
                      isInBag ? "bg-[#000000a1]" : "bg-black"
                    }  px-8 py-3 text-base font-medium text-white hover:bg-[#000000d6] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`}
                    disabled={isInBag || product.stock < 1}
                  >
                    {isInBag ? "Already in Bag" : "Add to Bag"}
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => handleAddToWishlist(e, product._id)}
                    className="btn mt-10 flex w-fit items-center justify-center rounded-md border border-transparent bg-black px-5 py-3 text-lg font-bold text-white hover:bg-[#000000d6] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    {/* <GoHeart /> */}
                    {wishlistIcon}
                  </button>
                </div>
              </form>
            </div>

            <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
              {/* Description and details */}
              <div>
                <h3 className="sr-only">Description</h3>

                <div className="space-y-6">
                  {loading ? (
                    <>
                      <div className="skeleton animate-pulse bg-gray-300 w-500 h-4"></div>
                      <div className="skeleton animate-pulse bg-gray-300 w-500 h-4"></div>
                      <div className="skeleton animate-pulse bg-gray-300 w-500 h-4"></div>
                      <div className="skeleton animate-pulse bg-gray-300 w-[400px] h-4"></div>
                    </>
                  ) : (
                    <p className="text-base text-gray-900">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-sm font-medium text-gray-900">
                  Highlights
                </h3>

                <div className="mt-4">
                  <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                    {/* {product.map((highlight) => (
                      <li key={highlight} className="text-gray-400">
                        <span className="text-gray-600">{highlight}</span>
                      </li>
                    ))} */}
                  </ul>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-sm font-medium text-gray-900">Details</h2>

                <div className="mt-4 space-y-6">
                  <p className="text-sm text-gray-600">{product.details}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <h1 className="text-xl text-black font-clash-display px-10 font-bold">
        Customer Review
      </h1>
      {product && product._id ? (
        <>
          <ReviewForm product={product} onReviewSubmit={handleReviewSubmit} />
          <ReviewSection
            productId={product._id}
            reviewsUpdated={reviewsUpdated}
          />
        </>
      ) : (
        <p>Loading product details...</p>
      )}

      {/* Related Products */}
      <div className="relative mx-auto max-w-2xl px-8 py-14 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-20">
        <h2 className="absolute top-[40px] font-bold text-2xl">
          Related Products
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {loading ? (
            <div className="w-[80vw] h-[50vh] flex justify-center items-center">
              <span className="loading loading-spinner loading-lg text-black"></span>
            </div>
          ) : relatedProducts && relatedProducts.length === 0 ? (
            <div className="w-[80vw] h-[50vh] font-bold flex justify-center items-center">
              <h1 className="text-2xl">No Related Products!</h1>
            </div>
          ) : (
            relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct._id}
                className="group cursor-pointer transition duration-500 ease-in-out hover:translate-y-[-10px] relative"
              >
                <div onClick={() => handleCardClick(relatedProduct._id)}>
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                    <img
                      src={relatedProduct.images[0]?.url}
                      alt={relatedProduct.productName}
                      className="h-full w-full object-cover object-center group-hover:opacity-75"
                    />
                  </div>
                  <h3 className="mt-4 text-sm text-gray-700">
                    {relatedProduct.productName}
                  </h3>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    ₹{relatedProduct.price}
                  </p>
                </div>

                {/* Add to bag button */}
                <div
                  className="btn w-fit bg-black text-white p-3 text-xl absolute right-0 cursor-pointer transition duration-500 delay-150 ease-in-out opacity-0 group-hover:opacity-100 group-hover:translate-y-[-20px] hover:scale-90 rounded-md"
                  onClick={(e) => handleAddToBag(e, relatedProduct._id)}
                >
                  <HiOutlineShoppingBag />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SingleProductPage;
