import { useEffect, useState } from "react";
import {
  blockUser,
  unblockUser,
  searchUsers,
  fetchUsersPagination,
} from "../../api/admin";
import { logoutUser } from "../../features/users/UserSlice";
import { useDispatch } from "react-redux";
import { persistor } from "../../app/Store";
import Pagination from "../user_components/pagination/Pagination";
import useDebounce from "../../hooks/useDebounce";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const [totalUsers, setTotalUsers] = useState(0);

  const dispatch = useDispatch();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      const response = debouncedSearchTerm
        ? await searchUsers(debouncedSearchTerm, currentPage, entriesPerPage)
        : await fetchUsersPagination(currentPage, entriesPerPage);
      setUsers(response.allUsers);
      setTotalUsers(response.totalUsers);
      setLoading(false);
    };
    getUsers();
  }, [currentPage, debouncedSearchTerm]);

  const handleBlockUser = async (uid) => {
    const updatedUser = await blockUser(uid);
    closeModal();
    // localStorage.removeItem("userToken");
    // dispatch(logoutUser());
    // persistor.purge();

    if (updatedUser) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        )
      );
    }
  };

  const handleUnblockUser = async (uid) => {
    const updatedUser = await unblockUser(uid);
    if (updatedUser) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        )
      );
    }
  };

  const openModal = (id) => {
    setUserId(id);
    setConfirmationModal(true);
  };

  const closeModal = () => setConfirmationModal(false);

  // Search Handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="absolute top-14 right-0 w-[1110px]">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
          <h1 className="text-white text-2xl">Users</h1>
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              id="table-search-users"
              value={searchTerm}
              onChange={handleSearch}
              className="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search for users"
            />
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              users &&
              users.map((user) => (
                <tr
                  key={user._id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <th
                    scope="row"
                    className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div className="ps-3">
                      <div className="text-base font-semibold">
                        {user.username}
                      </div>
                      <div className="font-normal text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    {new Date(user.createdAt).toDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          user.status === "active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        } me-2`}
                      ></div>
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === "active" ? (
                      <button
                        className="font-medium text-red-600 dark:text-red-400 hover:underline"
                        onClick={() => openModal(user._id)}
                      >
                        Block user
                      </button>
                    ) : (
                      <button
                        className="font-medium text-green-600 dark:text-green-400 hover:underline"
                        onClick={() => handleUnblockUser(user._id)}
                      >
                        Unblock user
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          className="mx-auto"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalEntries={totalUsers}
          entriesPerPage={entriesPerPage}
        />
      </div>

      {/* Confirmation Modal */}
      {confirmationModal && (
        <div
          id="popup-modal"
          tabIndex="-1"
          className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-md">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                type="button"
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={closeModal}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg
                  className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to block user?
                </h3>
                <button
                  onClick={() => handleBlockUser(userId)}
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Yes, I'm sure
                </button>
                <button
                  onClick={closeModal}
                  type="button"
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
