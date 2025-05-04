import React, { useEffect, useState } from "react";

const Rating = ({ initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const handleRating = (newRating) => {
    setRating(newRating);
    if (onRate) {
      onRate(newRating);
    }
  };

  // useEffect(() => {
  //   if (initialRating) {
  //     setRating(initialRating);
  //   }
  // }, [initialRating]);

  // I dont understand why doing the above is required, when we are initilaizing the rating state to initialRating which we are getting from props
  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
              starValue <= rating ? "text-yellow-500" : "text-gray-400"
            } `}
            onClick={() => handleRating(starValue)}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default Rating;
