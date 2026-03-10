import React from "react";
import ClassicCardimg from '../../../assets/images/homepage/Classic - 01.png'

const ClassicCard = ({img, name}) => {
  return (
    <div style={{ boxShadow: "5px 4px 8px #00000099" }} className="bg-[#d6d7da] rounded-xl">
      <img
        src={img}
        alt=""
        className="w-[230px]"
      />
      <h1 className="mb-[25px] font-bold text-center">{name}</h1>
    </div>
  );
};

export default ClassicCard;
