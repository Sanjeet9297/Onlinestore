import React from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import { Link } from "react-router-dom";

const OrderSuccessPage = () => {
  return (
    <div className="min-h-screen h-fit w-full">
      <Navbar />

      <div className="flex flex-col justify-center items-center gap-3 h-[75vh]">
        <h1 className="text-6xl font-bold">Thank You!</h1>
        <p className="text-md text-center">
          Your order has been successfully placed. <br /> We’re processing it
          now and will keep you updated every step of the way.
        </p>
        <div className="flex gap-5"> 
          <Link to={'/'} className="btn bg-black text-white">Home</Link>
          <Link to={'/profile/orders'} className="btn bg-black text-white">View Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
