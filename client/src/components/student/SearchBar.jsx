import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ data }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState(data ? data : "");
  const onSubmitHandler = (e) => {
    e.preventDefault();
    navigate(`/course-list/${input}`);
  };
  return (
    <form
      className="max-w-xl w-full flex items-center md:h-14 h-12 border border-gray-500/20 rounded"
      onSubmit={onSubmitHandler}
    >
      <img
        src={assets.search_icon}
        alt="search_icon"
        className="md:w-auto w-10 px-3"
      />
      <input
        type="text"
        placeholder="Search for courses"
        onChange={(e) => setInput(e.target.value)}
        value={input}
        className="w-full h-full text-gray-500/80 outline-none"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white md:px-10 md:py-3 px-7 py-2 mx-1 rounded cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
