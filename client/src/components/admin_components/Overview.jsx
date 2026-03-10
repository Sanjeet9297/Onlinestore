import React, { useEffect, useState } from "react";
import { IoMdPricetag } from "react-icons/io";
import { BsFillBarChartFill } from "react-icons/bs";
import { TiShoppingCart } from "react-icons/ti";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { useSelector } from "react-redux";
import { getOrders } from "../../api/order";
import img from "../../assets/images/homepage/check.webp";
import { getTopSellingProducts } from "../../api/product";
import { fetchCategories, getTopSellingCategories } from "../../api/category";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const Overview = () => {
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [overallOrderAmount, setOverallOrderAmount] = useState(0);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [costData, setCostData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [timeframe, setTimeframe] = useState("Weekly");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { allOrders } = await getOrders();
        const {data} = await fetchCategories();
        const { products } = await getTopSellingProducts();
        const { categories } = await getTopSellingCategories();
        setTopProducts(products);

        const filteredCategories = data.map(category => {
          const categoryDetails = categories.find(c => c._id === category._id);
          
          if (categoryDetails) {
            return {
              name: category.name, 
              totalQuantitySold: categoryDetails.totalQuantitySold
            };
          }
          return null; 
        }).filter(category => category !== null);

        setTopCategories(filteredCategories.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold));

        const totalCount = allOrders.length;
        const totalAmount = allOrders.reduce(
          (acc, order) => acc + order.totalAmount,
          0
        );
        const totalDiscount = allOrders.reduce(
          (acc, order) => acc + order.discountApplied,
          0
        );

        setTotalSalesCount(totalCount);
        setOverallOrderAmount(totalAmount);
        setOverallDiscount(totalDiscount);

        const dailyData = allOrders.reduce((acc, order) => {
          let key;
          if (timeframe === "Weekly") {
            key = new Date(order.placedAt).toLocaleString("default", {
              weekday: "long",
            });
          } else if (timeframe === "Monthly") {
            key = new Date(order.placedAt).toLocaleString("default", {
              month: "long",
            });
          } else {
            key = new Date(order.placedAt).getFullYear().toString();
          }

          if (!acc[key]) {
            acc[key] = { revenue: 0, cost: 0 };
          }

          acc[key].revenue += order.totalAmount;
          acc[key].cost += 100; // Adjust as necessary

          return acc;
        }, {});

        const chartLabels = Object.keys(dailyData);
        const chartRevenueData = chartLabels.map(
          (day) => dailyData[day].revenue
        );
        const chartCostData = chartLabels.map((day) => dailyData[day].cost);

        setLabels(chartLabels);
        setRevenueData(chartRevenueData);
        setCostData(chartCostData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [timeframe]);

  const updateTimeframe = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  // Update the chart data dynamically based on the fetched data
  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData, 
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "#cddf73",
        borderWidth: 2,
        tension: 0.3, 
      },
      {
        label: "Cost",
        data: costData, 
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "#8c74c5",
        borderWidth: 2,
        tension: 0.3, 
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue and Cost Over Time",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="absolute top-14 right-0 w-[1110px] h-[91vh]">
      <div className="flex pl-9 p-5 mt-3 gap-3">
      <div className="flex gap-5">
  {/* Left section */}
  <div className="w-[70%] flex flex-col gap-5">
    <div className="flex justify-between">
      <div className="px-12 py-6 rounded-md font-bold flex flex-col gap-3 bg-[#DAEAF0]">
        <div className="flex items-center gap-2">
          <IoMdPricetag className="bg-white text-4xl rounded-md p-1" />
          <h2>Total Sales</h2>
        </div>
        <h1>₹{Math.round(overallOrderAmount)}</h1>
      </div>
      <div className="px-12 py-6 rounded-md font-bold flex flex-col gap-3 bg-[#cddf73]">
        <div className="flex items-center gap-2">
          <BsFillBarChartFill className="bg-white text-4xl rounded-md p-1" />
          <h2>Total Profit</h2>
        </div>
        <h1>₹{Math.round(overallOrderAmount - overallDiscount)}</h1>
      </div>
      <div className="px-12 py-6 rounded-md font-bold flex flex-col gap-3 bg-[#8c74c5]">
        <div className="flex items-center gap-2">
          <TiShoppingCart className="bg-white text-4xl rounded-md p-1" />
          <h2>Total Orders</h2>
        </div>
        <h1>{totalSalesCount}</h1>
      </div>
    </div>

    {/* Chart */}
    <div className="relative flex justify-center items-center w-full h-full bg-white p-5 rounded-lg shadow-md">
      <Line data={lineChartData} options={chartOptions} />
      {/* Dropdown */}
      <div className="absolute right-3 top-3">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              {timeframe}{" "}
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 h-5 w-5 text-gray-400"
              />
            </Menu.Button>
          </div>
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                    } block px-4 py-2 text-sm`}
                    onClick={() => updateTimeframe("Weekly")}
                  >
                    Weekly
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                    } block px-4 py-2 text-sm`}
                    onClick={() => updateTimeframe("Monthly")}
                  >
                    Monthly
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                    } block px-4 py-2 text-sm`}
                    onClick={() => updateTimeframe("Yearly")}
                  >
                    Yearly
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  </div>

  {/* Right section */}
  <div className="w-[30%] bg-white p-5 rounded-lg shadow-md flex justify-center items-center">
    <Bar data={lineChartData} options={chartOptions} />
  </div>
</div>

      </div>

      {/* Section 2 */}
      <div className="flex justify-around mt-[-11px] pl-9 p-5 bg-[#1f2937]">
        {/* Top selling products */}
        <div className="bg-[#83c9e2] rounded-md p-3 w-[40%]">
          <h1>Top Selling Products</h1>

          <div>
            {topProducts.map((product) => (
              <div className="flex justify-between items-center border-b border-black py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      product.images[0]?.url||
                      "https://via.placeholder.com/150"
                    }
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-md w-[190px] font-medium">
                      {product.productName || "No product found"}
                    </h3>
                    {/* <p className="text-sm text-gray-500">{product.category}</p> */}
                  </div>
                </div>
                <div
                  className="bg-white w-8 h-8 cursor-pointer flex justify-center items-center rounded-full tooltip tooltip-success"
                  data-tip="Total Quantity Sold"
                >
                  <p className="font-semibold">
                    {product.totalQuantitySold || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Top selling categories */}
        <div className="bg-[#cddf73] rounded-md p-3 w-[40%]">
          <h1>Top Selling Categories</h1>

          <div>
            {topCategories.map((category) => (
              <div className="flex justify-between items-center border-b border-black py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={img}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-md w-[190px] font-medium">
                      {category.name || "No Category"}
                    </h3>
                  </div>
                </div>
                <div
                  className="bg-white w-8 h-8 cursor-pointer flex justify-center items-center rounded-full tooltip tooltip-success"
                  data-tip="Total Quantity Sold"
                >
                  <p className="font-semibold">{category.totalQuantitySold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Top selling brands */}
        {/* <div className="bg-[#997fd4] rounded-md p-3">
          <h1>Top Selling Brands</h1>

          <div>
            <div className="flex justify-between items-center border-b border-black py-4">
              <div className="flex items-center gap-4">
                <img src={img} className="w-20 h-20 object-cover rounded-lg" />
                <div>
                  <h3 className="text-md w-[190px] font-medium">
                    {"No product name"}
                  </h3>
                  <p className="text-sm text-gray-500">{"No category"}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold">₹5999</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Overview;
