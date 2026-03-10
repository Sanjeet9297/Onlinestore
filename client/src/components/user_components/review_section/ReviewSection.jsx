import { useEffect, useState } from "react";
import { fetchReviews } from "../../../api/review";
import { fetchUsers } from "../../../api/users";

const ReviewSection = ({ productId, reviewsUpdated }) => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchProductReviews = async () => {
      try {
        const data = await fetchReviews(productId);
        const allUsers = await fetchUsers();
        setReviews(data);
        setUsers(allUsers || []);
      } catch (error) {
        console.error("Error fetching reviews or users:", error);
        setUsers([]);
      }
    };

    fetchProductReviews();
  }, [productId, reviewsUpdated]);

  const getUserName = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user ? user.username : "Unknown User";
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="text-black font-bold px-10 font-clash-display">
      <hr />
      {reviews &&
        reviews.map((review, index) => (
          <div key={index} className="flex p-10 gap-8">
            <div>
              {/* <img
                src={review.profilePhoto || profilePhoto}
                alt="Profile Photo"
                className="w-[80px] h-[80px] rounded-[50%] object-cover"
              /> */}

              <div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                <svg
                  className="absolute w-12 h-12 text-gray-400 -left-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg">{getUserName(review.userId)}</h1>
              <p className="text-sm text-gray-600">
                {formatDate(review.createdAt)}
              </p>
              {/* rating */}
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <input
                    key={i}
                    type="radio"
                    name={`rating-${index}`}
                    className="mask mask-star text-black cursor-auto"
                    defaultChecked={i < review.rating}
                    disabled
                  />
                ))}
              </div>
              <h3>{review.review}</h3>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ReviewSection;
