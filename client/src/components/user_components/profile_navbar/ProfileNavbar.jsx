import React from "react";
import { Link } from "react-router-dom";

const ProfileNavbar = ({ totalOrders }) => {
  return (
    <div className="font-bold font-clash-display mt-5 text-black">
      <nav className="flex items-center justify-center w-full text-base">
        <ul className="flex gap-8">
          <Link to={"/profile"}>Profile</Link>
          <Link to={"/profile/orders"} className="group relative">
            Orders{" "}
            {totalOrders > 0 && (
              <span className="bg-black text-white px-2 py-1 rounded-full text-sm absolute top-5 opacity-0 group-hover:opacity-100 group-hover:top-0 transition-all duration-300 ease-in-out">
                {totalOrders}
              </span>
            )}
          </Link>
          <Link to={"/profile/coupons"}>Coupons</Link>
          <Link to={"/profile/wallet"}>Wallet</Link>
          <Link to={"/profile/settings"}>Settings</Link>
        </ul>
      </nav>
    </div>
  );
};

export default ProfileNavbar;
