import { useEffect, useState } from "react";
import sneakersCategoryImg from "../../../assets/images/homepage/Sneakers Category img.jpg";
import footballCategoryImg from "../../../assets/images/homepage/Football Category img.jpg";
import basketballCategoryImg from "../../../assets/images/homepage/Basketball Category img.jpg";
import { fetchCategories } from "../../../api/category";
import { Link, useNavigate } from "react-router-dom";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      try {
        const { data } = await fetchCategories();
        setCategories(data.filter((item) => item.isDeleted !== true));
      } catch (error) {
        console.error("Error fetching Category & Offer", error);
      }
    };
    getItems();
  }, []);

  const navigate = useNavigate();

  const handleNavigate = (categoryName) => {
    const encodedCategory = encodeURIComponent(categoryName);
    navigate(`/products?category=${encodedCategory}`);
  };

  return (
    <div>
      <div className="bg-[#fff] px-10 py-20 flex flex-col items-center">
        <h1 className="text-3xl font-clash-grotesk text-center">
          Step Into Style
        </h1>
        <div className="flex gap-[100px] mt-[3.75rem]">
          <img
            onClick={() => handleNavigate("Men's Shoes")}
            src={sneakersCategoryImg}
            alt=""
            className="w-[300px] object-cover cursor-pointer"
            style={{ boxShadow: "5px 4px 8px #00000099" }}
          />
          <img
            onClick={() => handleNavigate("Football")}
            src={footballCategoryImg}
            alt=""
            className="w-[300px] object-cover cursor-pointer"
            style={{ boxShadow: "5px 4px 8px #00000099" }}
          />
          <img
            onClick={() => handleNavigate("Basketball Shoes")}
            src={basketballCategoryImg}
            alt=""
            className="w-[300px] object-cover brightness-[0.9] cursor-pointer"
            style={{ boxShadow: "5px 4px 8px #00000099" }}
          />
        </div>
        <Link to="/categories">
          <button className="btn mx-auto mt-[3.75rem] px-14 bg-black text-white rounded-3xl">
            Show All
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;
