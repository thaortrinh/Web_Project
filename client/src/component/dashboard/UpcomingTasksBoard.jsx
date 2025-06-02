import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils";

const TaskItem = ({ task, workspaceId }) => {
  const navigate = useNavigate();

  const handleTaskClick = () => {
    navigate(`/board/${workspaceId}/task/${task.id}`);
  };

  // Function to map status number to text and styling
  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return {
          text: "TODO",
          textColor: "text-gray-600",
          dotColor: "bg-blue-500"
        };
      case 2:
        return {
          text: "IN-PROGRESS",
          textColor: "text-gray-600",
          dotColor: "bg-yellow-500"
        };
      case 3:
        return {
          text: "COMPLETED",
          textColor: "text-gray-600",
          dotColor: "bg-green-500"
        };
      default:
        return {
          text: "UNKNOWN",
          textColor: "text-gray-600",
          dotColor: "bg-gray-500"
        };
    }
  };

  // Function to render due date with suitable styling
  const renderDueDate = () => {
    if (task.daysLeft > 0) {
      return (
        <p className="text-xs text-[#E5252A] tracking-wide truncate">
          Due in {task.daysLeft} days
        </p>
      );
    } else if (task.daysLeft === 0) {
      return (
        <p className="inline-flex items-center !px-2 !py-1 rounded-full text-xs bg-yellow-100 text-red-700 tracking-wide">
          Due Today
        </p>
      );
    } else {
      // Expired task - background badge
      return (
        <span className="inline-flex items-center !px-2 !py-1 rounded-full text-xs bg-red-50 text-red-700 tracking-wide">
          Expired
        </span>
      );
    }
  };

  const statusInfo = getStatusInfo(task.status);

  return (
    <div
      className="bg-white rounded-lg !p-5 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
      onClick={handleTaskClick}
    >
      <div className="flex justify-between items-center !mb-2">
        <p className="text-3sm font-semibold text-blue-900 tracking-wide truncate">
          {task.title}
        </p>

        {/* Status and Priority container */}
        <div className="flex items-center gap-5">
          {/* Status element */}
          <span className={`inline-flex items-center text-xs ${statusInfo.textColor}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor} !mr-2`}></span>
            {statusInfo.text}
          </span>
          
          {/* Priority element */}
          <span
            className={`!px-3 !py-1 text-xs rounded-full ${
              task.priority === "High"
                ? "bg-[#FFDBD8] text-[#D04226]"
                : task.priority === "Medium"
                ? "bg-[#FEF9C3] text-[#E37F0A]"
                : "bg-green-100 text-green-700"
            }`}
          >
            {task.priority}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 !mb-2 truncate">{task.description}</p>

      <div className="flex justify-between items-center !mt-4">
        <div className="flex items-center">
          <svg
            className="w-5 h-4 text-[#E5252A] !mr-1"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 7V12L15 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {renderDueDate()}
        </div>
        <div className="flex">
          {task.assignedUsers.map((user, index) => (
            <div
              key={index}
              className={`!w-8 !h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(
                user.id
              )}`}
              style={{
                marginLeft: index > 0 ? "-5px" : "0",
              }}
            >
              {user.photoPath ? (
                <img
                  src={user.photoPath}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UpcomingTaskBoard = ({ tasks }) => {
  const { workspacedId } = useParams();

  const upcomingTasks = tasks.filter((task) => {
    // check if isCompleted => not show in UpcomingTaskBoard
    const isCompleted = task.status === 3;

    if (isCompleted) return false;
    if (task.daysLeft >= 7) return false;

    return true;
  });

  return (
    <div className="!pt-3">
      <h2 className="text-xl font-bold text-[#455294]">
        Upcoming Tasks ({upcomingTasks.length})
      </h2>
      <br />
      <div className="flex flex-col gap-2">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task, index) => (
            <TaskItem
              key={task.id || index}
              task={task}
              workspaceId={workspacedId}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 !py-8 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-300 !mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-400">
                No upcoming tasks
              </p>
              <p className="text-xs text-gray-300 !mt-1">
                All tasks are either completed or due later than 7 days
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingTaskBoard;