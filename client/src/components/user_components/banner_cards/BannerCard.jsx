import React from "react";
import nikeCardImg from "../../../assets/images/homepage/nike card img.png";

const BannerCard = () => {
  return (
    <div
      className="flex w-[355px] h-[90px] rounded-md font-bold"
      style={{ boxShadow: "7px 5px 12px #00000099" }}
    >
      <img
        src={nikeCardImg}
        alt=""
        className="w-[210px] h-[250px] relative bottom-[127px] rotate-[342deg]"
      />
      <div className="flex flex-col justify-center">
        <h1>Nike Pegasus 41 GORE-TEX</h1>
        <p>₹ 14995</p>
      </div>
    </div>
  );
};

export default BannerCard;
