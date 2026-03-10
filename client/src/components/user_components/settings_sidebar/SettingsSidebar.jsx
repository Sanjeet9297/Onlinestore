import React from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { PiPackage } from "react-icons/pi";
import { MdOutlineWidthWide } from "react-icons/md";

const SettingsSidebar = () => {
  return (
    <div className="text-black font-clash-display w-[300px]">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div>
          <nav>
            <ul className="text-lg flex flex-col gap-4">
              <Link to={"/profile/settings"} className="flex gap-3">
                <FiUser className="text-[23px]" /> Account Details
              </Link>
              <Link
                to={"/profile/settings/delivery-addresses"}
                className="flex gap-3"
              >
                <PiPackage className="text-[23px]" /> Delivery Addresses
              </Link>
              {/* <li className="flex gap-3">
                <MdOutlineWidthWide className="text-[23px]" /> Shop Preferances
              </li> */}
            </ul>
          </nav>
        </div>
    </div>
  );
};

export default SettingsSidebar;
