import React, { useRef, useState } from "react";
import Calendar from "./Calendar";
import { StatusDropdown, PriorityDropdown } from "./Dropdowns";

const TaskHeader = ({
  task,
  editMode,
  toggleEditMode,
  handleSaveField,
  isManager,
  isAssignee,
}) => {
  const titleInputRef = useRef(null);
  const [titleValue, setTitleValue] = useState(task.title);

  // Permission checks
  const canEditTitle = isManager;
  const canEditDueDate = isManager;
  const canEditStatus = isManager || isAssignee;
  const canEditPriority = isManager;

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveField(field, titleValue);
    }
    if (e.key === "Escape") {
      toggleEditMode(field);
    }
  };

  // Reset the local title state when edit mode changes
  React.useEffect(() => {
    if (editMode.title) {
      setTitleValue(task.title);
    }
  }, [editMode.title, task.title]);

  // Handle title click with permission check
  const handleTitleClick = () => {
    if (canEditTitle) {
      toggleEditMode("title");
    }
  };

  // Handle status toggle with permission check
  const handleStatusToggle = () => {
    if (canEditStatus) {
      toggleEditMode("status");
    }
  };

  // Handle priority toggle with permission check
  const handlePriorityToggle = () => {
    if (canEditPriority) {
      toggleEditMode("priority");
    }
  };

  // Handle date change with permission check
  const handleDateChange = (date) => {
    if (canEditDueDate) {
      handleSaveField("dueDate", date);
    }
  };

  return (
    <div className="!mb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column - Title and due date */}
      <div className="col-span-2">
        {/* Title */}
        {editMode.title ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => handleSaveField("title", titleValue)}
                onKeyDown={(e) => handleKeyDown(e, "title")}
                className="text-2xl font-bold text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none w-full !px-2 !py-1"
                autoFocus
              />
            </div>
          </div>
        ) : (
          <h1
            className={`text-2xl font-bold text-gray-900 py-1 px-2 rounded-md transition-colors ${
              canEditTitle
                ? "cursor-pointer hover:bg-gray-50"
                : "cursor-not-allowed"
            }`}
            onClick={handleTitleClick}
            title={
              !canEditTitle
                ? "Only managers can edit task title"
                : "Click to edit title"
            }
          >
            {task.title}
          </h1>
        )}

        {/* Calendar */}
        <div className="!mt-2">
          <Calendar
            selectedDate={task.dueDate}
            onDateChange={handleDateChange}
            disabled={!canEditDueDate}
            isManager={isManager}
          />
        </div>
      </div>

      {/* Right Column - Status and Priority */}
      <div className="max-w-[260px]">
        <div className="flex items-center justify-between !mt-2 !mb-2">
          {/* Status with dropdown */}
          <StatusDropdown
            status={task.status}
            isOpen={editMode.status}
            onToggle={handleStatusToggle}
            onSelect={(status) => handleSaveField("status", status)}
            disabled={!canEditStatus}
            canEdit={canEditStatus}
          />

          {/* Priority with dropdown */}
          <PriorityDropdown
            priority={task.priority}
            isOpen={editMode.priority}
            onToggle={handlePriorityToggle}
            onSelect={(priority) => handleSaveField("priority", priority)}
            disabled={!canEditPriority}
            canEdit={canEditPriority}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;