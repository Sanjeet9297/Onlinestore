import { useState, useEffect } from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import { fetchCategories } from "../../../api/category";
import sneakersCategoryImg from "../../../assets/images/homepage/Sneakers Category img.jpg";
import footballCategoryImg from "../../../assets/images/homepage/Football Category img.jpg";
import basketballCategoryImg from "../../../assets/images/homepage/Basketball Category img.jpg";
import womenCategoryImg from "../../../assets/images/homepage/Women category Image.jpg";
import unisexCategoryImg from "../../../assets/images/homepage/Unisex category Image.jpg";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getItems = async () => {
      setLoading(true);
      try {
        const { data } = await fetchCategories();
        setCategories(data.filter((item) => item.isDeleted !== true));
      } catch (error) {
        console.error("Error fetching Category & Offer", error);
      } finally {
        setLoading(false);
      }
    };
    getItems();
  }, []);

  const handleNavigate = (categoryName) => {
    const encodedCategory = encodeURIComponent(categoryName);
    navigate(`/products?category=${encodedCategory}`);
  };

  const getImageByCategory = (name) => {
    switch (name) {
      case "Men's Shoes":
        return sneakersCategoryImg;
      case "Football":
        return footballCategoryImg;
      case "Basketball Shoes":
        return basketballCategoryImg;
      case "Women's Shoes":
        return womenCategoryImg;
      case "Unisex Shoes":
        return unisexCategoryImg;
      default:
        return sneakersCategoryImg; // fallback (optional)
    }
  };

  return (
    <div className="min-h-screen h-auto">
      <Navbar />
      <div className="relative mx-auto max-w-2xl px-8 py-14 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-20">
        {categories && categories.length !== 0 && (
          <h2 className="absolute top-[40px] font-bold text-2xl">Categories</h2>
        )}

        <div className="flex flex-wrap justify-center gap-[100px] mt-20">
          {loading ? (
            <div className="w-[80vw] h-[50vh] flex justify-center items-center">
              <span className="loading loading-spinner loading-lg text-black"></span>
            </div>
          ) : categories.length === 0 ? (
            <div className="w-[80vw] h-[50vh] font-bold flex justify-center items-center">
              <h1 className="text-2xl">Your Wishlist Is Empty!</h1>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="cursor-pointer flex flex-col items-center"
                onClick={() => handleNavigate(category.name)}
              >
                <img
                  src={getImageByCategory(category.name)}
                  alt={category.name}
                  className="w-[300px] object-cover cursor-pointer"
                  style={{ boxShadow: "5px 4px 8px #00000099" }}
                />
                <h3 className="mt-4 text-lg font-medium text-center">
                  {category.name}
                </h3>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
