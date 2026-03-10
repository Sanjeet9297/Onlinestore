import React from "react";
import productImg from "../../../assets/images/auth/nike.png";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleCardClick = (productID) => {
    navigate(`/products/${productID}`);
  };

  return (
    <div
      className="w-[240px] bg-transparent px-3 py-4 text-center cursor-pointer transition duration-500 ease-in-out hover:translate-y-[-10px]"
      // style={{ boxShadow: "5px 4px 8px #00000099" }}
      onClick={() => handleCardClick(product._id)}
    >
      <div>
        {product.images ? (
          <img
            src={product.images[0]?.url}
            alt=""
            className="w-[290px] relative bottom-[10px] rounded-lg"
          />
        ) : (
          <img
            src={productImg}
            alt=""
            className="w-[240px] rotate-[320deg] relative right-[33px] bottom-[37px]"
          />
        )}
      </div>
      <div>
        <h2>{product.productName || "No Name"}</h2>
        {/* <p>₹{product.price || "1000"}</p> */}
      </div>
    </div>
  );
};

export default ProductCard;
