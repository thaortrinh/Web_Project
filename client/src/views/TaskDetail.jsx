import { useState, useEffect, useCallback } from "react";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";

import PageLayout from "../component/board/task-detail/PageLayout";
import TaskHeader from "../component/board/task-detail/TaskHeader";
import TaskDescription from "../component/board/task-detail/TaskDescription";
import SubtaskList from "../component/board/task-detail/SubtaskList";
import AssigneesDropdown from "../component/board/task-detail/AssigneesDropdown";
import AssetsList from "../component/board/task-detail/AssetsList";
import { BackButton } from "../component/board/task-detail/Buttons";

import { fetchManagerAndCheckRole } from "../utils/workspaceUtils";

function TaskDetail() {
  const { workspaceId, taskId } = useParams();

  const [task, setTask] = useState(null);
  const [originalTask, setOriginalTask] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({
    title: false,
    description: false,
    status: false,
    priority: false,
  });

  // Workspace role tracking
  const [workspaceRole, setWorkspaceRole] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [isAssignee, setIsAssignee] = useState(false);

  // Function to check workspace role using the new utility
  const checkWorkspaceRole = async (workspaceId) => {
    try {
      const result = await fetchManagerAndCheckRole(workspaceId);

      if (result.success) {
        setIsManager(result.isManager);
        setWorkspaceRole(
          result.isManager ? "myWorkspace" : "assignedWorkspace"
        );
      } else {
        // Set default values on error
        setIsManager(false);
        setWorkspaceRole("assignedWorkspace");
      }
    } catch (error) {
      console.error("Error checking workspace role:", error);
      // Set default values on error
      setIsManager(false);
      setWorkspaceRole("assignedWorkspace");
    }
  };

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://task-up.up.railway.app/getTaskDetail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: taskId,
          workspaceId: workspaceId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const task = {
          id: data.task.id,
          title: data.task.title,
          description: data.task.description,
          status: data.task.status,
          priority: data.task.priority,
          dueDate: data.task.dueDate,
          assignedTo: data.task.assignedTo,
          assets: data.task.assets,
          availableMembers: data.task.availableMembers,
          // Convert numeric completed values to boolean
          subtasks: data.task.subtasks.map((subtask) => ({
            ...subtask,
            completed: Boolean(subtask.completed),
          })),
        };
        setTask(task);
        setOriginalTask(JSON.parse(JSON.stringify(task)));
      } else {
        toast.error(data.message || "Failed to fetch task", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Error: " + (error.message || "Unknown error"), {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch task data
  useEffect(() => {
    fetchTaskDetail();
  }, [taskId, workspaceId]);

  // Check workspace role - chỉ chạy 1 lần khi workspaceId thay đổi
  useEffect(() => {
    if (workspaceId) {
      checkWorkspaceRole(workspaceId);
    }
  }, [workspaceId]);

  // Detect changes
  useEffect(() => {
    if (task && originalTask) {
      const hasChangesValue =
        JSON.stringify(task) !== JSON.stringify(originalTask);
      setHasChanges(hasChangesValue);
    }
  }, [task, originalTask]);

  useEffect(() => {
    if (task && task.assignedTo) {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData && userData.userId) {
          const userIsAssignee = task.assignedTo.some(
            (assignee) => assignee.id === userData.userId
          );
          setIsAssignee(userIsAssignee);
        }
      } catch (error) {
        console.error("Error checking assignee status:", error);
        setIsAssignee(false);
      }
    }
  }, [task]);

  // Toggle edit mode for a field
  const toggleEditMode = useCallback((field) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Save field value
  const handleSaveField = useCallback((field, value) => {
    setTask((prev) => ({ ...prev, [field]: value }));
    setEditMode((prev) => ({ ...prev, [field]: false }));
  }, []);

  // Update handlers
  const handleSubtasksChange = useCallback((updatedSubtasks) => {
    setTask((prev) => ({ ...prev, subtasks: updatedSubtasks }));
  }, []);

  const handleAssigneesChange = useCallback((newAssignees) => {
    setTask((prev) => ({ ...prev, assignedTo: newAssignees }));
  }, []);

  const handleUpdateTask = useCallback(async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        toast.error("User data not found. Please login again.", {
          position: "top-right",
        });
        return;
      }

      const response = await fetch("https://task-up.up.railway.app/updateTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newTask: task,
          originalTask: originalTask,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOriginalTask(JSON.parse(JSON.stringify(task)));
        setHasChanges(false);
        toast.success("Task updated successfully!", {
          position: "top-right",
        });
      } else {
        toast.error(data.message || "Failed to update task", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error update task:", error);
      toast.error(
        "Error updating task: " + (error.message || "Unknown error"),
        {
          position: "top-right",
        }
      );
    }
  }, [task, originalTask]);

  if (!task) {
    return <PageLayout isLoading={true} />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Fixed Navbar with workspace role */}
      <div className="fixed top-0 right-0 left-0 z-20">
        <Navbar activeTab={workspaceRole} />
      </div>

      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-16 h-screen z-10">
        <Sidebar workspaceId={workspaceId} />
      </div>

      {/* PageLayout to account for fixed navbar and sidebar */}
      <div className="flex-1 flex flex-col !mt-16 bg-gray-50">
        <div className="flex-1 !p-8 md:p-6 overflow-auto !ml-50">
          <div className="!mb-6">
            <BackButton workspaceId={workspaceId} />
          </div>

          <div className="bg-white rounded-lg shadow !p-8 !mb-6">
            {/* Task Header with isManager and isAssignee prop */}
            <TaskHeader
              task={task}
              editMode={editMode}
              toggleEditMode={toggleEditMode}
              handleSaveField={handleSaveField}
              isManager={isManager}
              isAssignee={isAssignee}
            />

            {/* Task Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 !mt-8">
              {/* Left column - Task Description and Subtasks */}
              <div className="col-span-2">
                <TaskDescription
                  description={task.description}
                  editMode={editMode.description}
                  toggleEditMode={() => toggleEditMode("description")}
                  handleSaveField={(value) =>
                    handleSaveField("description", value)
                  }
                  isManager={isManager}
                />

                {/* Subtasks */}
                <div className="!mt-8">
                  <h3 className="font-semibold text-gray-900 !mb-3">
                    Subtasks:
                  </h3>
                  <SubtaskList
                    subtasks={task.subtasks}
                    onSubtasksChange={handleSubtasksChange}
                    isManager={isManager}
                    isAssignee={isAssignee}
                  />
                </div>
              </div>

              {/* Right column - Assignees and Assets */}
              <div className="col-span-1 max-w-[260px]">
                {/* Assignees section */}
                <div className="!mb-8">
                  <h3 className="font-semibold text-gray-900 !mb-3">
                    Assignees:
                  </h3>
                  <AssigneesDropdown
                    assignees={task.assignedTo}
                    availableMembers={task.availableMembers}
                    onAssigneesChange={handleAssigneesChange}
                    isManager={isManager}
                  />
                </div>

                {/* Assets section */}
                <div className="!mb-6">
                  <h3 className="font-semibold text-gray-900 !mb-3">Assets:</h3>
                  <AssetsList assets={task.assets} />
                </div>
              </div>
            </div>

            {/* Update button */}
            <div className="!mt-10 flex justify-end">
              <button
                className={`!px-6 !py-2 !mr-8 rounded-md text-white font-medium 
                  ${
                    hasChanges
                      ? "bg-blue-400 hover:bg-blue-900 cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                disabled={!hasChanges}
                onClick={handleUpdateTask}
              >
                UPDATE
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
      />
    </div>
  );
}

export default TaskDetail;
