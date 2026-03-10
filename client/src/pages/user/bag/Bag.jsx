import { useEffect, useState } from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import BagSection from "../../../components/user_components/bag_item_section/BagSection";
import { delFromBag, fetchBag } from "../../../api/bag";
import { useDispatch, useSelector } from "react-redux";
import { removeProduct, storeSubtotal } from "../../../features/bag/BagSlice";
import { Link } from "react-router-dom";
import { fetchCategories } from "../../../api/category";

const DELIVERY_FEE = 100;

const Bag = () => {
  const { uid } = useSelector((state) => state.user);

  const { calculatedSubtotal } = useSelector(
    (state) => state.bag.bags[uid] || { calculatedSubtotal: 0 }
  );
  const quantities = useSelector(
    (state) => state.bag.bags[uid]?.quantities || {}
  );

  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getBag = async () => {
      setLoading(true);
      try {
        const { bagItems } = await fetchBag(uid);
        console.log("Bag Items:", bagItems); // Temporary debug log
        const { data } = await fetchCategories();
        setCategories(data);
        setProducts(bagItems.filter((item) => !item.isDeleted).reverse());
      } catch (error) {
        console.error("Error fetching bag items:", error);
      } finally {
        setLoading(false);
      }
    };
    if (uid) {
      getBag();
    }
  }, [uid]);

  // Calculate subtotal whenever products change
  const offers = useSelector((state) => state.offers);

  useEffect(() => {
    // subtotal based on products and quantities
    const calculatedSubtotal = products.reduce((acc, product) => {
      const quantity = quantities[product.productId] || 0;

      const productOffer = offers[product.productId];
      const discount = productOffer ? productOffer.discount : 0;

      // calculating discount
      const priceAfterDiscount =
        discount > 0 ? product.price - discount : product.price;

      const itemTotal = priceAfterDiscount * quantity;
      return acc + itemTotal;
    }, 0);

    dispatch(storeSubtotal({ userId: uid, subtotal: calculatedSubtotal }));
  }, [products, quantities, dispatch, uid, offers]);

  // Function to update product quantity and recalculate subtotal
  const updateSubtotal = (productId, newQuantity) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) => {
        if (product.productId === productId) {
          const productOffer = offers[product.productId];
          const discount = productOffer ? productOffer.discount : 0;

          const priceAfterDiscount =
            discount > 0 ? product.price - discount : product.price;

          return { ...product, quantity: newQuantity, priceAfterDiscount };
        }
        return product;
      });

      const newSubtotal = updatedProducts.reduce(
        (acc, product) =>
          acc +
          (product.priceAfterDiscount || product.price) *
            (product.quantity || 0),
        0
      );

      // Dispatch the new subtotal to Redux
      dispatch(storeSubtotal({ userId: uid, subtotal: newSubtotal }));

      return updatedProducts;
    });
  };

  const total = calculatedSubtotal + DELIVERY_FEE;

  //handle bag product deleteation from child component with callback function
  const handleDeleteProduct = async (productId) => {
    try {
      await delFromBag(uid, productId);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.productId !== productId)
      );
      dispatch(removeProduct({ userId: uid, productId }));
      dispatch(storeSubtotal({ userId: uid, subtotal: calculatedSubtotal }));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="min-h-screen h-auto">
      <Navbar />
      <div className="pt-11 px-32">
        {loading ? (
          <div className="w-full h-[75vh] flex justify-center items-center">
            <span className="loading loading-spinner loading-lg text-black"></span>
          </div>
        ) : products && products.length === 0 ? (
          <div className="w-full h-[75vh] font-bold flex justify-center items-center">
            <h1 className="text-2xl">Your Bag Is Empty!</h1>
          </div>
        ) : (
          <div className="flex gap-10">
            <div>
              <h1 className="text-3xl font-bold">Bag</h1>

              {products &&
                products.map(
                  (product) =>
                    !product.isDeleted && (
                      <BagSection
                        key={product.productId}
                        img={
                          product.productImage&&
                          product.productImage?.url
                        }
                        name={product.productName}
                        category={
                          categories.find(
                            (category) => category._id === product.category
                          )?.name || ""
                        }
                        managePrice={product.price}
                        qty={product.quantity}
                        stock={product.stock}
                        productId={product.productId}
                        removeProduct={handleDeleteProduct}
                        onQuantityChange={updateSubtotal}
                      />
                    )
                )}
            </div>

            <div className="w-full flex flex-col gap-3">
              <h1 className="text-2xl mb-5">Summary</h1>

              <div className="flex justify-between">
                <h1>Subtotal</h1>
                <h1>₹{(calculatedSubtotal || 0).toFixed(2)}</h1>
              </div>
              <div className="flex justify-between">
                <h1>Estimated Delivery & Handling</h1>
                <h1>₹{DELIVERY_FEE.toFixed(2)}</h1>
              </div>
              <hr />
              <div className="flex justify-between">
                <h1>Total</h1>
                <h1>₹{total.toFixed(2)}</h1>
              </div>
              <hr />

              <Link to={"/bag/checkout"}>
                <button className="btn rounded-full mt-3 w-full bg-black text-white tracking-[1px]">
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default Bag;
