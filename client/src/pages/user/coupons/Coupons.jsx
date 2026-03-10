import React, { useEffect, useState } from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import ProfileNavbar from "../../../components/user_components/profile_navbar/ProfileNavbar";
import { fetchCoupons } from "../../../api/coupons";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const Coupons = () => {
  const {uid} = useSelector((state) => state.user);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const getCoupons = async () => {
      const allCoupons = await fetchCoupons();
      console.log(allCoupons);
      setCoupons(allCoupons.filter((coupon) => coupon.status && !coupon.usedBy.includes(uid)));
    };
    getCoupons();
  }, []);

  //copy code
  const handleCouponCodeCopy = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code Copied");
  }

  return (
    <div className="text-black min-h-screen h-fit">
      <Navbar />
      <ProfileNavbar />

      <div className="pt-8 px-36">
        <h1 className="text-2xl font-bold">Your Coupons</h1>
        <hr />

        {/* Coupon Section */}

        <div className="flex gap-10 pt-12 relative">
          {coupons.length === 0 ? (
            <h1 className="absolute top-0">No Coupon Available</h1>
          ) : (
            coupons.map((coupon) => (
              <div className="border border-black w-fit p-6 rounded-md text-center">
                <h2 className="text-lg font-bold">{coupon.name}</h2>
                <h1 className="font-bold text-md">
                  {coupon.discountPercentage}% OFF
                </h1>
                <h3 className="text-md underline">{coupon.description}</h3>
                <h3 className="font-bold text-md">code :- {coupon.code}</h3>
                <button
                  className="btn tracking-wider bg-black text-white py-2 px-8 rounded-md"
                  onClick={() => handleCouponCodeCopy(coupon.code)}
                >
                  Copy Code
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Coupons;
