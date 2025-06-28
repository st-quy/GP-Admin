import React from "react";
import { Input } from "antd";

const { Search } = Input;

const SearchInput = ({
  onSearchChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <Search
      placeholder={placeholder}
      size="large"
      onChange={onSearchChange}
      className={`mb-4 w-[250px] sm:w-[200px] md:w-[250px] lg:w-[250px] text-[#9CA3AF] ${className}`}
    />
  );
};

export default SearchInput;
