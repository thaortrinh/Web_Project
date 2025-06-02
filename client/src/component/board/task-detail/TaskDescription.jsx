import React, { useRef, useState, useEffect } from "react";

const TaskDescription = ({ description, editMode, toggleEditMode, handleSaveField, isManager }) => {
  const descriptionInputRef = useRef(null);
  const [localDescription, setLocalDescription] = useState(description);

  // Update local state when the prop changes or when entering edit mode
  useEffect(() => {
    setLocalDescription(description);
  }, [description, editMode]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent adding new line
      handleSaveField(localDescription);
    }
    if (e.key === "Escape") {
      toggleEditMode();
    }
  };

  // Handle local changes without triggering the save function each time
  const handleChange = (e) => {
    setLocalDescription(e.target.value);
  };

  // Save the description when user finishes editing
  const handleSave = () => {
    handleSaveField(localDescription);
  };

  // Handle click for non-managers
  const handleDescriptionClick = () => {
    if (isManager) {
      toggleEditMode();
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 !mb-2">
        Task description:
      </h3>

      {editMode ? (
        <div className="flex flex-col gap-2">
          <textarea
            ref={descriptionInputRef}
            value={localDescription}
            onChange={handleChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-300 rounded-md !p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-24"
            autoFocus
          />
        </div>
      ) : (
        <p
          className={`text-gray-600 !p-2 rounded-md ${
            isManager 
              ? "cursor-pointer hover:bg-gray-50" 
              : "cursor-not-allowed"
          }`}
          onClick={handleDescriptionClick}
          title={!isManager ? "Only managers can edit task description" : "Click to edit description"}
        >
          {description || "No description added. Click to add one."}
        </p>
      )}
    </div>
  );
};

export default TaskDescription;