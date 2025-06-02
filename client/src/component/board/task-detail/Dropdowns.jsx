import React, { useRef, useEffect } from "react";

// Constant options
const STATUS_OPTIONS = [
  { id: "TODO", label: "TODO", color: "bg-blue-500" },
  { id: "IN-PROGRESS", label: "IN-PROGRESS", color: "bg-yellow-500" },
  { id: "COMPLETED", label: "COMPLETED", color: "bg-green-500" },
];

const PRIORITY_OPTIONS = [
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

// Base dropdown component
const Dropdown = ({ trigger, menu, isOpen, reference }) => (
  <div className="relative" ref={reference}>
    {trigger}
    {isOpen && (
      <div className="absolute top-full left-0 !mt-2 bg-white shadow-lg rounded-md border border-gray-200 z-10">
        {menu}
      </div>
    )}
  </div>
);

// Helper functions
const getStatusColor = (status) => {
  const option = STATUS_OPTIONS.find((opt) => opt.id === status);
  return option ? option.color : "bg-gray-500";
};

const getPriorityClasses = (priority) => {
  const option = PRIORITY_OPTIONS.find((opt) => opt.id === priority);
  return option
    ? `${option.bgClass} ${option.textClass}`
    : "bg-gray-100 text-gray-700";
};

// Status dropdown component
export const StatusDropdown = ({
  status,
  isOpen,
  onToggle,
  onSelect,
  disabled = false,
  canEdit = true,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const handleToggle = () => {
    if (canEdit) {
      onToggle();
    }
  };

  const statusTrigger = (
    <div
      className={`flex items-center !p-1 rounded-md ${
        canEdit ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed"
      }`}
      onClick={handleToggle}
      title={
        !canEdit
          ? "You don't have permission to change status"
          : "Click to change status"
      }
    >
      <span
        className={`h-2 w-2 rounded-full ${getStatusColor(status)} !mr-2`}
      ></span>
      <span className="text-sm text-gray-500 uppercase">
        {status.replace("-", " ")}
      </span>
      {canEdit && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400 !ml-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  const statusMenu = (
    <div className="w-40">
      {STATUS_OPTIONS.map((option) => (
        <div
          key={option.id}
          className="flex items-center !px-3 !py-2 hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(option.id)}
        >
          <span className={`h-2 w-2 rounded-full ${option.color} !mr-2`}></span>
          <span className="text-sm">{option.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Dropdown
      isOpen={isOpen && canEdit}
      reference={dropdownRef}
      trigger={statusTrigger}
      menu={statusMenu}
    />
  );
};

// Priority dropdown component
export const PriorityDropdown = ({
  priority,
  isOpen,
  onToggle,
  onSelect,
  disabled = false,
  canEdit = true,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  const handleToggle = () => {
    if (canEdit) {
      onToggle();
    }
  };

  const priorityTrigger = (
    <div
      className={`text-xs !px-2 !py-1 rounded-full flex items-center ${getPriorityClasses(
        priority
      )} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}`}
      onClick={handleToggle}
      title={
        !canEdit
          ? "You don't have permission to change priority"
          : "Click to change priority"
      }
    >
      {priority}
      {canEdit && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 ml-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  const priorityMenu = (
    <div className="w-34">
      {PRIORITY_OPTIONS.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between !px-3 !py-2 text-left text-sm hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(option.id)}
        >
          <span
            className={`!px-2 !py-1 rounded-full text-xs ${option.bgClass} ${option.textClass}`}
          >
            {option.label}
          </span>
          {priority === option.id && (
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
        </div>
      ))}
    </div>
  );

  return (
    <Dropdown
      isOpen={isOpen && canEdit}
      reference={dropdownRef}
      trigger={priorityTrigger}
      menu={priorityMenu}
    />
  );
};

export { STATUS_OPTIONS, PRIORITY_OPTIONS };
