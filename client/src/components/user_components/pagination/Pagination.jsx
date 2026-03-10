import React from "react";

const Pagination = ({
  currentPage,
  setCurrentPage,
  totalEntries,
  entriesPerPage,
}) => {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <div className="text-center mb-[30px]">
      <div className="flex flex-col items-center">
        <div className="inline-flex mt-2 xs:mt-0">
          {/* Prev Button */}
          <button
            className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-black rounded-s hover:bg-gray-900 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <svg
              className="w-3.5 h-3.5 me-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5H1m0 0 4 4M1 5l4-4"
              />
            </svg>
            Prev
          </button>

          <div className="w-6 h-10 bg-gray-500 flex items-center justify-center text-white">
            <h1>{currentPage}</h1>
          </div>

          {/* Next Button */}
          <button
            className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-black border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-black dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
            <svg
              className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
