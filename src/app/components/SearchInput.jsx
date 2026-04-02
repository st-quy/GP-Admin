import React from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

const SearchInput = ({
  onSearchChange,
  value,
  placeholder = "Search...",
  className = "",
  style = {},
  isFigmaRedesign = false,
}) => {
  if (isFigmaRedesign) {
    return (
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onSearchChange}
        className={`figma-search-input ${className}`}
        style={style}
        prefix={<SearchOutlined className="text-[#9CA3AF]" />}
        allowClear
      />
    );
  }

  return (
    <Search
      placeholder={placeholder}
      size="large"
      value={value}
      onChange={onSearchChange}
      className={`mb-4 w-[250px] sm:w-[200px] md:w-[250px] lg:w-[250px] text-[#9CA3AF] ${className}`}
      style={style}
    />
  );
};

export default SearchInput;
