import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUndoAlt, FaTrashAlt } from "react-icons/fa";
import ConfirmationModal from "./ConfirmationModal";

const TrashBin = ({ trashTask, workspaceId, isManager }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);

  useEffect(() => {
    fetchTasks(trashTask);
  }, [trashTask]);

  const mapStage = (state) => {
    switch (state) {
      case 1:
        return "TODOS";
      case 2:
        return "IN-PROGRESS";
      case 3:
        return "COMPLETED";
      default:
        return "TODOS";
    }
  };

  const mapPriority = (priority) => {
    switch (priority) {
      case 3:
        return "Low";
      case 2:
        return "Medium";
      case 1:
        return "High";
      default:
        return "Medium";
    }
  };

  const fetchTasks = async (trashTask) => {
    const transformedTasks = trashTask.map((row) => {
      const id = row.id || row.TaskId;

      return {
        id: id,
        title: row.title || row.taskname,
        stage: mapStage(row.StateCompletion),
        priority: mapPriority(row.priority),
      };
    });

    setTasks(transformedTasks);
  };

  const restoreTask = async (taskId) => {
    try {
      setIsLoading(true);

      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        toast.error("User not logged in", { position: "top-right" });
        return;
      }

      const requestBody = {
        taskId: parseInt(taskId, 10) || taskId,
        workspaceId: parseInt(workspaceId, 10) || workspaceId,
        userId: userData.userId,
      };

      const response = await fetch(
        "https://task-up.up.railway.app/restoreTrashTask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update the UI
        setTasks(tasks.filter((task) => task.id !== taskId));
        toast.success("Task restored successfully", { position: "top-right" });
      } else {
        toast.error(data.message || "Failed to restore task", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Error: " + (error.message || "Unknown error"), {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // permanently delete a task
  const permanentlyDeleteTask = async (taskId) => {
    try {
      setIsLoading(true);

      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        toast.error("User not logged in", { position: "top-right" });
        return;
      }

      const response = await fetch(
        "https://task-up.up.railway.app/permanentlyDeleteTask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: taskId,
            workspaceId: workspaceId,
            userId: userData.userId,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // update UI
        setTasks(tasks.filter((task) => task.id !== taskId));
        toast.success("Task permanently deleted", { position: "top-right" });
      } else {
        toast.error(data.message || "Failed to delete task", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Error: " + (error.message || "Unknown error"), {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // restore all tasks
  const restoreAllTasks = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        toast.error("User not logged in", { position: "top-right" });
        return;
      }

      // create an array of promises to restore each task
      const restorePromises = tasks.map((task) =>
        fetch("https://task-up.up.railway.app/restoreTrashTask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: task.id,
            workspaceId: workspaceId,
            userId: userData.userId,
          }),
        }).then((res) => res.json())
      );

      // execute all promises
      const results = await Promise.all(restorePromises);

      // Check if all operations were successful
      const allSuccessful = results.every((data) => data.success);

      if (allSuccessful) {
        setTasks([]);
        toast.success("All tasks restored successfully", {
          position: "top-right",
        });
      } else {
        toast.warning("Some tasks could not be restored", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Error: " + (error.message || "Unknown error"), {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // permanently delete all tasks
  const deleteAllTasks = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        toast.error("User not logged in", { position: "top-right" });
        return;
      }

      // Create an array of promises to delete each task
      const deletePromises = tasks.map((task) =>
        fetch("https://task-up.up.railway.app/permanentlyDeleteTask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: task.id,
            workspaceId: workspaceId,
            userId: userData.userId,
          }),
        }).then((res) => res.json())
      );

      // Execute all promises
      const results = await Promise.all(deletePromises);

      const allSuccessful = results.every((data) => data.success);

      if (allSuccessful) {
        setTasks([]);
        toast.success("All tasks permanently deleted", {
          position: "top-right",
        });
      } else {
        toast.warning("Some tasks could not be deleted", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Error: " + (error.message || "Unknown error"), {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Direct restore (no confirmation modal)
  const handleRestoreTask = (id) => {
    if (isLoading) return;
    const taskName = tasks.find((t) => t.id === id)?.title || "Task";
    restoreTask(id);
  };

  // Direct restore all (no confirmation modal)
  const handleRestoreAll = () => {
    if (tasks.length === 0 || isLoading) return;
    restoreAllTasks();
  };

  const confirmDeleteTask = (id) => {
    setTaskToDelete(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = () => {
    permanentlyDeleteTask(taskToDelete);
    setShowConfirm(false);
    setTaskToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setTaskToDelete(null);
  };

  const confirmDeleteAll = () => {
    if (tasks.length === 0) return;
    setDeleteAllConfirm(true);
  };

  const handleDeleteAllConfirmed = () => {
    deleteAllTasks();
    setDeleteAllConfirm(false);
  };

  const handleCancelDeleteAll = () => {
    setDeleteAllConfirm(false);
  };

  // stage styles
  const stageStyles = {
    TODOS: {
      dot: "bg-blue-500",
      text: "text-gray-600",
    },
    "IN-PROGRESS": {
      dot: "bg-yellow-500",
      text: "text-gray-600",
    },
    COMPLETED: {
      dot: "bg-green-500",
      text: "text-gray-600",
    },
  };

  const StageIndicator = ({ stage }) => (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${stageStyles[stage].dot}`}></div>
      <span className={`text-sm ${stageStyles[stage].text} uppercase`}>
        {stage === "IN-PROGRESS" ? "IN PROGRESS" : stage}
      </span>
    </div>
  );

  // Priority badge styles with improved amber color for Medium
  const priorityStyles = {
    High: {
      bg: "bg-red-100",
      text: "text-red-700",
    },
    Medium: {
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
    Low: {
      bg: "bg-green-100",
      text: "text-green-700",
    },
  };

  const PriorityBadge = ({ priority }) => (
    <span
      className={`!px-3 !py-1 rounded-full text-xs ${priorityStyles[priority].bg} ${priorityStyles[priority].text}`}
    >
      {priority}
    </span>
  );

  return (
    <div className="bg-gray-50 min-h-screen relative">
      <ToastContainer
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable={false}
      />
      <div className="flex justify-between items-center !mb-6">
        <h1 className="text-xl font-bold text-[#455294]">Trash Bin</h1>
        {isManager && (
          <div className="flex gap-8">
            <button
              onClick={handleRestoreAll}
              className={`transition-colors duration-200 !px-4 !py-2 rounded-lg cursor-pointer ${
                tasks.length === 0 || isLoading
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-green-600 hover:bg-green-100 hover:text-green-700"
              }`}
              disabled={tasks.length === 0 || isLoading}
            >
              Restore all
            </button>
            <button
              onClick={confirmDeleteAll}
              className={`transition-colors duration-200 !px-4 !py-2 rounded-lg cursor-pointer ${
                tasks.length === 0 || isLoading
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-red-600 hover:bg-red-100 hover:text-red-700"
              }`}
              disabled={tasks.length === 0 || isLoading}
            >
              Delete all
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="!py-4 !px-8 text-left font-semibold">
                Task title
              </th>
              <th className="!py-4 !px-8 text-left font-semibold">Stage</th>
              <th className="!py-4 !px-8 text-left font-semibold">Priority</th>
              {isManager && (
                <th className="!py-4 !px-8 text-center font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="text-base !py-4 !px-8 text-gray-600">
                  {task.title}
                </td>
                <td className="!py-4 !px-8">
                  <StageIndicator stage={task.stage} />
                </td>
                <td className="!py-4 !px-8">
                  <PriorityBadge priority={task.priority} />
                </td>
                {isManager && (
                  <td className="!py-4 !px-8 flex justify-center gap-8">
                    <button
                      onClick={() => handleRestoreTask(task.id)}
                      className="text-green-600 hover:scale-110 transition cursor-pointer"
                      disabled={isLoading}
                    >
                      <FaUndoAlt />
                    </button>
                    <button
                      onClick={() => confirmDeleteTask(task.id)}
                      className="text-red-600 hover:scale-110 transition cursor-pointer"
                      disabled={isLoading}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td
                  colSpan={isManager ? "4" : "3"}
                  className="!py-16 text-center text-gray-400"
                >
                  Trash is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showConfirm && (
        <ConfirmationModal
          onConfirm={handleDeleteConfirmed}
          onCancel={handleCancelDelete}
          message="Are you sure you want to permanently delete this task?"
          isLoading={isLoading}
        />
      )}

      {deleteAllConfirm && (
        <ConfirmationModal
          onConfirm={handleDeleteAllConfirmed}
          onCancel={handleCancelDeleteAll}
          message="Are you sure you want to permanently delete all tasks?"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TrashBin;
