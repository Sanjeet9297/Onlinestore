import React, { useEffect, useState } from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import ProfileNavbar from "../../../components/user_components/profile_navbar/ProfileNavbar";
import {
  cancelOrder,
  changePaymentStatus,
  getOrderProducts,
  getUserOrders,
} from "../../../api/order";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { IoMdDownload, IoMdRefresh } from "react-icons/io";
import { handlePayment } from "../../../api/payment";
import { BiTimeFive } from "react-icons/bi";
import { IoIosCheckmarkCircle } from "react-icons/io";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { fetchCategories } from "../../../api/category";
import { Link } from "react-router-dom";
import Pagination from "../../../components/user_components/pagination/Pagination";

const ListOrders = () => {
  const { uid, username, email } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reRender, setReRender] = useState(false);
  const [loading, setLoading] = useState(false);
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const { allOrders, totalOrders } = await getUserOrders(
          uid,
          currentPage,
          entriesPerPage
        );
        setTotalOrders(totalOrders);
        const { data } = await fetchCategories();
        setCategories(data);
        const ordersWithProducts = await Promise.all(
          allOrders.map(async (order) => {
            const { data } = await getOrderProducts(order._id);
            return {
              ...order,
              items: data.items || [],
            };
          })
        );

        setOrders(ordersWithProducts);
        setLoading(false);
        setReRender(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setReRender(false);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [uid, reRender, currentPage]);

  //Retry Payment
  const handleRetryPayment = async (orderId, totalAmount, phonenumber) => {
    try {
      await handlePayment(username, email, totalAmount, phonenumber)
        .then(async (res) => {
          console.log("Success", orderId, res);
          await changePaymentStatus(orderId, "Completed");
          setReRender(true);
        })
        .catch(async (err) => {
          console.log("pending", err);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="text-black min-h-screen h-fit">
      <Navbar />
      <ProfileNavbar totalOrders={totalOrders} />

      <div className="pt-8 px-36 pb-5">
        <h1 className="text-2xl font-bold">Your Orders</h1>
        <hr />

        {loading ? (
          <div className="w-full flex flex-col py-3 border-b border-gray-400">
            <div className="skeleton animate-pulse h-4 w-48 bg-gray-300 mt-3"></div>
            <div className="skeleton animate-pulse h-4 w-48 bg-gray-300 mt-3"></div>

            <div className="skeleton animate-pulse h-4 w-48 bg-gray-300 mt-3"></div>

            <div className="flex items-center">
              <div className="skeleton animate-pulse h-2.5 w-2.5 bg-gray-300 rounded-full me-2"></div>
              <div className="skeleton animate-pulse h-4 w-48 bg-gray-300 mt-3"></div>
            </div>
            <hr className="my-4" />

            <div className="flex justify-between items-center border-b border-gray-200 py-4">
              <div className="flex items-center gap-4">
                <div className="skeleton animate-pulse w-20 h-20 bg-gray-300 object-cover rounded-lg"></div>
                <div>
                  <div className="skeleton animate-pulse text-md w-[190px] h-4 bg-gray-300 font-medium"></div>
                  <div className="skeleton animate-pulse text-sm w-[150px] h-4 mt-2 bg-gray-300"></div>
                </div>
              </div>
              <div>
                <div className="skeleton animate-pulse text-sm w-[150px] h-4 bg-gray-300"></div>
                <div className="skeleton animate-pulse text-sm w-[150px] h-4 mt-2 bg-gray-300"></div>
              </div>
              <div>
                <div className="skeleton animate-pulse text-sm w-[150px] h-4 bg-gray-300"></div>
              </div>
            </div>
            <button className="skeleton animate-pulse h-12 mt-4 px-4 py-2 bg-gray-400 border-0 rounded-lg transition"></button>
          </div>
        ) : (
          <>
            {orders.length === 0 ? (
              <p>No orders available.</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  id="invoice"
                  className="relative w-full flex flex-col py-3 border-b-2 border-black"
                >
                  <p>
                    Placed At: {new Date(order.placedAt).toLocaleDateString()}
                  </p>
                  <p>Total Amount: ₹{Math.round(order.totalAmount)}</p>
                  <div>
                    <p className="flex items-center">
                      Payment Method: {order.paymentMethod}
                      {(order.paymentMethod === "razorPay" ||
                        order.paymentMethod === "Wallet") && (
                        <span
                          className={`px-3 py-1 rounded flex items-center gap-1 ${
                            order.paymentStatus === "Pending"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {"  "}
                          {order.paymentStatus === "Pending" ? (
                            <>
                              <BiTimeFive /> Pending
                            </>
                          ) : (
                            <>
                              <IoIosCheckmarkCircle /> {order.paymentStatus}
                            </>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-500"
                          : order.status === "Cancelled"
                          ? "bg-red-500"
                          : ["Shipped", "Returned"].includes(order.status)
                          ? "bg-yellow-500"
                          : order.status === "Processing"
                          ? "bg-blue-500"
                          : ""
                      } me-2`}
                    ></div>
                    <p>{order.status}</p>
                  </div>
                  {order.isCancelled ? (
                    <h1 className="mx-auto text-red-500 font-bold text-lg">
                      Order cancelled
                    </h1>
                  ) : (
                    order.isReturned && (
                      <h1 className="mx-auto text-yellow-500 font-bold text-lg">
                        Order returned
                      </h1>
                    )
                  )}

                  {/* buttons */}
                  <div className="absolute right-0 flex flex-col items-end gap-3">
                    <Link to={`/profile/orders/${order._id}`}>
                      <p className="underline cursor-pointer">See Details</p>
                    </Link>
                    {order.paymentMethod === "razorPay" &&
                    order.paymentStatus === "Pending" &&
                    !order.isCancelled ? (
                      <button
                        className="btn"
                        onClick={() =>
                          handleRetryPayment(
                            order._id,
                            order.totalAmount,
                            order.shippingAddress.phonenumber
                          )
                        }
                      >
                        <IoMdRefresh /> Retry Payment
                      </button>
                    ) : null}
                  </div>
                  {/* <hr className="my-4" /> */}

                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center border-t border-gray-200 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              item.product?.images[0]?.url ||
                              "https://via.placeholder.com/150"
                            }
                            alt={item.product?.productName || "Product Image"}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="text-md w-[190px] font-medium">
                              {item.product?.productName || "No product name"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {categories.find(
                                (category) =>
                                  category._id === item.product?.category
                              )?.name || ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{item.price}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No items found in this order.
                    </p>
                  )}
                </div>
              ))
            )}

            {orders.length >= 5 && (
              <Pagination
                className="mx-auto"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalEntries={totalOrders}
                entriesPerPage={entriesPerPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListOrders;
