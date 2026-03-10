import React, { useState } from "react";
import { useSelector } from "react-redux";
import { addReview } from "../../../api/review";
import { toast } from "react-toastify";

const ReviewForm = ({ product, onReviewSubmit }) => {
  const { uid } = useSelector((state) => state.user);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");

    if (!token) {
      toast.info("Login to add review!");
      return;
    }
    
    if (!reviewText.trim() || rating === 0) {
      toast.error("Please add a review and a rating.");
      return;
    }

    const reviewData = {
      userId: uid,
      productId: product._id,
      review: reviewText,
      rating,
    };

    setLoading(true);

    try {
      await addReview(reviewData);
      if (onReviewSubmit) onReviewSubmit(); //To Notify parent about the update
      setReviewText("");
      setRating(0);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error submitting review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg p-6 px-10 max-w-md text-black">
      {/* Toggle Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn bg-black text-white py-2 px-4 rounded-md transition mb-4"
      >
        Add Review
      </button>

      {/* Modal structure */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

          {/* Modal content */}
          <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full flex justify-center items-center">
            <div
              className="relative flex flex-col items-center w-full h-[80vh] max-w-[40rem] bg-white rounded-3xl shadow p-9"
              onClick={(e) => e.stopPropagation()}
            >
                <button
                  onClick={closeModal}
                  className="text-black bg-gray-300 hover:bg-gray-200 hover:text-black rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
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
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              <div className="p-4 md:p-5">
                <div className="flex text-center flex-col">
                  <h3 className="text-xl font-medium text-black">
                    Write a Review
                  </h3>
                  <p className="text-gray-500">Share your thoughts with the community.</p>
                </div>
              </div>

              {/* Modal body */}
              <div className="flex items-center gap-4">
                <img
                  src={product.images[0] || "https://via.placeholder.com/150"}
                  alt={product?.productName || "Product Image"}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <h3 className="text-md w-[190px] font-medium">
                  {product?.productName || "No product name"}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <h1>Overall rating *</h1>
                <div className="rating mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <React.Fragment key={star}>
                      <input
                        type="radio"
                        name="rating-1"
                        className="mask mask-star"
                        checked={star === rating}
                        onChange={() => handleRating(star)}
                      />
                    </React.Fragment>
                  ))}
                </div>

                {/* Review Text Area */}
                <textarea
                  className="w-full h-28 p-2 border border-black rounded mb-4 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`w-full bg-black text-white py-3 px-4 rounded-full hover:bg-gray-800 transition ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewForm;
