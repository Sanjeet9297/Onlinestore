import React, { useEffect, useState } from "react";
import Navbar from "../../../components/user_components/navbar/Navbar";
import ProfileNavbar from "../../../components/user_components/profile_navbar/ProfileNavbar";
import { getUserWallet } from "../../../api/wallet";
import { useSelector } from "react-redux";
import Pagination from "../../../components/user_components/pagination/Pagination";

const Wallet = () => {
  const uid = useSelector((state) => state.user.uid);
  const [wallet, setWallet] = useState([]);
  const [balance, setBalance] = useState(0);
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    const getWallet = async () => {
      const { transactions, totalBalance, totalTransactions } =
        await getUserWallet(uid, currentPage, entriesPerPage);
      setBalance(totalBalance);
      setTotalTransactions(totalTransactions);
      setWallet(transactions);
    };
    getWallet();
  }, [currentPage]);

  return (
    <div className="text-black min-h-screen h-fit">
      <Navbar />
      <ProfileNavbar />

      <div className="pt-8 px-36">
        <h1 className="text-2xl font-bold">Your Wallet</h1>
        <hr />

        {wallet.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <div>
            <div className="flex justify-between my-3">
              <h2 className="text-lg">
                Total Transactions : <span>{totalTransactions}</span>
              </h2>
              <h2 className="text-lg">
                Your Balance : <span>₹{Math.round(balance)}</span>
              </h2>
            </div>

            {/* table */}
            <div>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3">
                        D/C
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet &&
                      wallet.map((data) => (
                        <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                          <th
                            scope="row"
                            className="track px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                          >
                            {data.description}
                          </th>
                          <td className="px-6 py-4">
                            {new Date(data.date).toDateString()}
                          </td>
                          <td className="px-6 py-4">{data.type}</td>
                          <td
                            className={`px-6 py-4 ${
                              data.type === "Debit"
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {data.type === "Debit"
                              ? `- ₹${Math.round(data.amount)}`
                              : `+ ₹${Math.round(data.amount)}`}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {wallet.length >= 5 && (
          <Pagination
            className="mx-auto"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalEntries={totalTransactions}
            entriesPerPage={entriesPerPage}
          />
        )}
      </div>
    </div>
  );
};

export default Wallet;
