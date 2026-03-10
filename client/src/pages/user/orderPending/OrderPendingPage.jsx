import React from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import { Link } from "react-router-dom";

const OrderPendingPage = () => {
  return (
    <div className="min-h-screen h-fit w-full">
      <Navbar />

      <div className="flex flex-col justify-center items-center gap-3 h-[75vh]">
        {/* Alert */}
        <div role="alert" className="alert alert-warning w-fit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Warning: Your Payment is Pending!</span>
        </div>

        <h1 className="text-6xl font-bold">Order Received!</h1>
        <p className="text-md text-center">
          Your order has been placed successfully, but the payment is still
          pending. <br />
          Please complete the payment to proceed with processing your order.{" "}
          <br />
          Check your email or order details for payment instructions.
        </p>

        <div className="flex gap-5">
          <Link to={"/"} className="btn bg-black text-white">
            Home
          </Link>
          <Link to={"/profile/orders"} className="btn bg-black text-white">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderPendingPage;
