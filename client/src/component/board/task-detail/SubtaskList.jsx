import { useState } from "react";

const SubtaskList = ({ subtasks, onSubtasksChange, isManager, isAssignee }) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Check if user can modify subtasks (toggle status)
  const canModifyStatus = isManager || isAssignee;

  // Check if user can add/remove subtasks
  const canAddRemoveSubtasks = isManager;

  const handleToggleSubtask = (subtaskId) => {
    if (!canModifyStatus) return;

    const updatedSubtasks = subtasks.map((subtask) =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    onSubtasksChange(updatedSubtasks);
  };

  const handleRemoveSubtask = (subtaskId) => {
    if (!canAddRemoveSubtasks) return;

    const updatedSubtasks = subtasks.filter(
      (subtask) => subtask.id !== subtaskId
    );
    onSubtasksChange(updatedSubtasks);
  };

  const handleAddSubtask = () => {
    if (!canAddRemoveSubtasks || newSubtask.trim() === "") return;

    const newSubtaskObj = {
      id: Math.floor(Math.random() * 10000), // Simple ID generation
      title: newSubtask,
      completed: false,
    };

    onSubtasksChange([...subtasks, newSubtaskObj]);
    setNewSubtask("");
    setIsAddingSubtask(false);
  };

  const handleCancelAddingSubtask = () => {
    setIsAddingSubtask(false);
    setNewSubtask("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    }
    if (e.key === "Escape") {
      handleCancelAddingSubtask();
    }
  };

  const handleStartAddingSubtask = () => {
    if (canAddRemoveSubtasks) {
      setIsAddingSubtask(true);
    }
  };

  return (
    <div>
      <ul className="!space-y-2">
        {subtasks.map((subtask) => (
          <li key={subtask.id} className="flex items-center group">
            <button
              type="button"
              className={`!w-5 !h-5 rounded-full border ${
                subtask.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-300 hover:border-blue-400"
              } flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 !mr-3 transition-colors ${
                canModifyStatus
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => handleToggleSubtask(subtask.id)}
              disabled={!canModifyStatus}
              title={
                !canModifyStatus
                  ? "Only managers and assignees can update subtask status"
                  : "Toggle subtask completion"
              }
            >
              {subtask.completed && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 ${
                subtask.completed
                  ? "line-through text-gray-400"
                  : "text-gray-700"
              }`}
            >
              {subtask.title}
            </span>

            {/* Remove button - only show for managers */}
            {canAddRemoveSubtasks && (
              <button
                onClick={() => handleRemoveSubtask(subtask.id)}
                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
                title="Remove subtask"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* Add new subtask option - only show for managers */}
      {canAddRemoveSubtasks && (
        <>
          {!isAddingSubtask ? (
            <button
              onClick={handleStartAddingSubtask}
              className="flex items-center text-[#2b7fff] hover:text-blue-700 !mt-4 text-sm cursor-pointer"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="!h-5 !w-5 !mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add subtask
            </button>
          ) : (
            <div className="flex items-center !mt-4">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 border border-gray-300 rounded-md !px-3 !py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleCancelAddingSubtask}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 !py-2 !px-3 rounded-md text-sm font-medium !ml-2"
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubtaskList;