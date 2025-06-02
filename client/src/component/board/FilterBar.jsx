import React, { useState, useRef, useEffect } from "react";

const FilterBar = ({
  activeFilter,
  setActiveFilter,
  priorityFilter,
  setPriorityFilter,
  isManager,
  openTaskForm,
}) => {
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPriorityDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (isPriorityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPriorityDropdownOpen]);

  // Status filters configuration
  const filters = [
    { id: "ALL", label: "ALL" },
    { id: "TODO", label: "TODO" },
    { id: "IN-PROGRESS", label: "IN-PROGRESS" },
    { id: "COMPLETED", label: "COMPLETED" },
  ];

  // Priority filter options - matching API response format
  const priorityOptions = [
    {
      id: "ALL",
      label: "All",
      bgClass: "bg-blue-100",
      textClass: "text-blue-700",
    },
    {
      id: "High",
      label: "High",
      bgClass: "bg-red-100",
      textClass: "text-red-800",
    },
    {
      id: "Medium",
      label: "Medium",
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-800",
    },
    {
      id: "Low",
      label: "Low",
      bgClass: "bg-green-100",
      textClass: "text-green-800",
    },
  ];

  // Handle priority filter selection
  const handlePrioritySelect = (priority) => {
    setPriorityFilter(priority);
    setIsPriorityDropdownOpen(false);
  };

  // Get current priority option for display
  const getCurrentPriorityOption = () => {
    return (
      priorityOptions.find((option) => option.id === priorityFilter) ||
      priorityOptions[0]
    );
  };

  return (
    <div className="!mb-6">
      {/* FILTER BAR */}
      <div className="flex items-center justify-between border-b border-gray-300 !pb-4">
        <div className="flex items-center !space-x-8">
          {/* Status Filters */}
          <div className="flex !space-x-6">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`!py-2 !px-1 font-medium text-sm relative flex items-center ${
                  activeFilter === filter.id
                    ? "text-blue-800"
                    : "text-gray-500 hover:text-gray-900 cursor-pointer"
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <div className="w-5 flex items-center justify-center">
                  {filter.id === "TODO" && (
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  )}
                  {filter.id === "IN-PROGRESS" && (
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  )}
                  {filter.id === "COMPLETED" && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Priority Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className={`flex items-center cursor-pointer !space-x-2 !px-3 !py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getCurrentPriorityOption().bgClass
              } ${getCurrentPriorityOption().textClass}`}
              onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
            >
              <span>{getCurrentPriorityOption().label}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isPriorityDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isPriorityDropdownOpen && (
              <div className="absolute top-full left-0 !mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                {priorityOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full flex items-center justify-between !px-3 !py-2 text-left text-sm hover:bg-gray-50 ${
                      priorityFilter === option.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handlePrioritySelect(option.id)}
                  >
                    <span
                      className={`!px-2 !py-1 rounded-full text-xs ${option.bgClass} ${option.textClass}`}
                    >
                      {option.label}
                    </span>
                    {priorityFilter === option.id && (
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Button */}
        {isManager && (
          <button
            className="bg-blue-400 hover:bg-blue-900 text-white !py-2 !px-4 rounded-md text-sm font-medium cursor-pointer"
            onClick={openTaskForm}
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
