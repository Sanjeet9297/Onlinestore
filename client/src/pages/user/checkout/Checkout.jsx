import React, { useState } from "react";
import CheckoutForm from "../../../components/user_components/checkout_formsection/CheckoutForm";
import Navbar from "../../../components/user_components/navbar/Navbar";
import { useSelector } from "react-redux";

const DELIVERY_FEE = 100;

const Checkout = () => {
  const { uid } = useSelector((state) => state.user);
  const { calculatedSubtotal } = useSelector(
    (state) => state.bag.bags[uid] || { calculatedSubtotal: 0 }
  );

  const total = calculatedSubtotal + DELIVERY_FEE;

  const [discountApplied, setDiscountApplied] = useState(0);
  //function to get discount applied form child
  const getDiscountApplied = (discount) => {
    setDiscountApplied(discount);
  };

  return (
    <div className="min-h-screen h-fit">
      <div className="min-h-screen h-auto">
        <Navbar />
        <div className="pt-11 px-32">
          {/* <div className="w-full h-[75vh] flex justify-center items-center">
            <span className="loading loading-spinner loading-lg text-black"></span>
          </div> */}
          <div className="flex gap-10">
            <div>
              <h1 className="text-3xl font-bold">Checkout</h1>

              <CheckoutForm getDiscountApplied={getDiscountApplied} />
            </div>

            <div className="w-full flex flex-col gap-3">
              <h1 className="text-2xl mb-5">Order Summary</h1>

              {discountApplied !== 0 ? (
                <>
                  <div className="flex justify-between">
                    <h1>Subtotal</h1>
                    <h1>
                      ₹
                      {(
                        Number(calculatedSubtotal) + Number(discountApplied)
                      ).toFixed(2)}
                    </h1>
                  </div>
                  <div className="flex justify-between">
                    <h1>Coupon Discount</h1>
                    <h1>-₹{discountApplied.toFixed(2)}</h1>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <h1>Subtotal</h1>
                  <h1>₹{calculatedSubtotal.toFixed(2)}</h1>
                </div>
              )}
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
            </div>

            {/* coupon display */}
            <div></div>
          </div>
        </div>

        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Checkout;
