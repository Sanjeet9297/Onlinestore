import React from "react";
import ClassicCard from "../classic_card/ClassicCard";
import ClassicCardimg1 from '../../../assets/images/homepage/Classic - 01.png'
import ClassicCardimg2 from '../../../assets/images/homepage/Classic - 02.png'
import ClassicCardimg3 from '../../../assets/images/homepage/Classic - 03.png'

const ClassicSpotlight = () => {
  return (
    <div>
      <div className="bg-[#fff] px-10 py-20 flex flex-col items-center">
        <h1 className="text-3xl font-clash-grotesk text-center">
          Classic Spotlight
        </h1>
        <div className="flex gap-[100px] mt-[4.75rem]">
          <ClassicCard img={ClassicCardimg1} name={"VOMERO"} />
          <ClassicCard img={ClassicCardimg1} name={"CORTEZ"} />
          <ClassicCard img={ClassicCardimg3} name={"V2K"} />
        </div>
        <button className="btn mx-auto mt-[4.75rem] px-14 bg-black text-white rounded-3xl">
          Show All
        </button>
      </div>
    </div>
  );
};

export default ClassicSpotlight;
