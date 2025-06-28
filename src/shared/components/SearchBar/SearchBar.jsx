import React, { useState } from "react";
import { Button } from "antd";

/**
 * Reusable SearchBar component for use across multiple pages
 *
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text for search input
 * @param {string} props.value - Current search input value
 * @param {Function} props.onChange - Handler for when search input changes
 * @param {Function} props.onSubmit - Handler for when search is submitted
 * @param {Function} props.onClear - Handler for when search is cleared
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.buttonText - Text for the search button (default: "Search")
 * @param {boolean} [props.hideButton] - Whether to hide the search button (default: false)
 * @returns {JSX.Element} SearchBar component
 */
const SearchBar = ({
  placeholder = "Search...",
  value = "",
  onChange,
  onSubmit,
  onClear,
  className = "",
  hideButton = false,
}) => {
  // Internal state for controlled input
  const [internalValue, setInternalValue] = useState(value);

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) onChange(newValue, e);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(internalValue, e);
  };

  // Handle clearing the search
  const handleClear = () => {
    setInternalValue("");
    if (onClear) onClear();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="relative w-full">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-[48px] rounded-lg bg-white pt-[12px] pr-[40px] pb-[12px] pl-[20px] 
          focus:outline-none  font-['Inter'] text-[16px] leading-[24px] tracking-[0px] 
          placeholder:text-[#9CA3AF] placeholder:font-['Inter'] placeholder:font-normal placeholder:text-[16px] 
          placeholder:leading-[24px]"
          value={internalValue}
          onChange={handleChange}
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[40px] top-1/2 transform -translate-y-1/2 flex items-center justify-center w-[16px] h-[16px] text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <div className="absolute right-[16px] top-1/2 transform -translate-y-1/2 flex items-center justify-center w-[16px] h-[16px] gap-[5px]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_4338_181)">
              <path
                d="M15.0348 14.3133L15.0348 14.3133L15.0377 14.3156C15.0472 14.3232 15.0514 14.3295 15.0536 14.3336C15.0559 14.338 15.0576 14.3432 15.0582 14.3498C15.0592 14.3623 15.0564 14.3856 15.0346 14.4128C15.0307 14.4177 15.0276 14.4197 15.0249 14.421C15.0225 14.4222 15.0152 14.4252 15 14.4252C15.0038 14.4252 14.9998 14.4258 14.9885 14.4216C14.9786 14.418 14.9668 14.412 14.955 14.4038L10.7894 11.0364L10.4556 10.7665L10.1383 11.0556C9.10157 12.0002 7.79541 12.5252 6.40002 12.5252C4.93302 12.5252 3.56009 11.9531 2.52858 10.9216C0.39884 8.7919 0.39884 5.30849 2.52858 3.17875C3.56009 2.14724 4.93302 1.5752 6.40002 1.5752C7.86703 1.5752 9.23996 2.14724 10.2715 3.17875L10.2715 3.17875L10.2736 3.18083C12.2161 5.10054 12.3805 8.14775 10.8214 10.2801L10.5409 10.6637L10.9098 10.9633L15.0348 14.3133ZM2.62147 10.8287C3.63937 11.8466 4.96619 12.4002 6.40002 12.4002C7.82817 12.4002 9.18252 11.8505 10.1798 10.8275C12.2759 8.75511 12.2713 5.3644 10.1786 3.27164C9.16068 2.25375 7.83386 1.7002 6.40002 1.7002C4.96674 1.7002 3.6404 2.25332 2.62266 3.27045C0.524124 5.34263 0.527898 8.73518 2.62147 10.8287Z"
                fill="#6B7280"
                stroke="#6B7280"
              />
            </g>
            <defs>
              <clipPath id="clip0_4338_181">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
