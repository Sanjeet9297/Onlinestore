import { useEffect, useState } from "react";
import ProductCard from "../product_card/ProductCard";
import { fetchThreeNewArrivals } from "../../../api/product";
import { Link } from "react-router-dom";

const NewArrival = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const { products } = await fetchThreeNewArrivals();
      setProducts(products);
    };
    getData();
  }, []);

  return (
    <div className="bg-[#fff] px-10 py-20 flex flex-col items-center">
      <h1 className="text-3xl font-clash-grotesk text-center">
        See What&apos;s New
      </h1>
      <div className="flex gap-[100px] mt-[4.75rem]">
        {products &&
          products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
      <Link to={"/products"}>
        <button className="btn mx-auto mt-[3.75rem] px-14 bg-black text-white rounded-3xl">
          Show All
        </button>
      </Link>
    </div>
  );
};

export default NewArrival;
