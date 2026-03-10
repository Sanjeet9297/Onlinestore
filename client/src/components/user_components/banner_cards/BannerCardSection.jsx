import React from "react";
import { Link } from "react-router-dom";
import BannerCard from "./BannerCard";

const BannerCardSection = () => {
  return (
    <div className=" flex w-full h-[148px] px-10 justify-center items-start">
      <Link to={"/products"}>
          <button className="btn bg-black text-white font-normal rounded-full px-6 w-fit">
            The New Wave →
          </button>
      </Link>
      {/* <div className='flex gap-5'>
        <BannerCard />
        <BannerCard />
        <BannerCard />
      </div> */}
    </div>
  );
};

export default BannerCardSection;
