import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import Task from "../component/board/Task";
import TaskForm from "../component/board/TaskForm";
import FilterBar from "../component/board/FilterBar";
import { fetchManagerAndCheckRole } from "../utils/workspaceUtils";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";

const Board = () => {
  const { workspacedId } = useParams();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [tasks, setTasks] = useState([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [workspaceRole, setWorkspaceRole] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [managerData, setManagerData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const checkWorkspaceRole = async (workspaceId) => {
    try {
      const result = await fetchManagerAndCheckRole(workspaceId);

      if (result.success) {
        setManagerData(result.manager);
        setIsManager(result.isManager);
        setWorkspaceRole(
          result.isManager ? "myWorkspace" : "assignedWorkspace"
        );
      } else {
        // No manager found or error occurred
        setManagerData(null);
        setIsManager(false);
        setWorkspaceRole("assignedWorkspace");

        if (result.error !== "No manager found") {
          console.error("Error checking workspace role:", result.error);
        }
      }
    } catch (error) {
      console.error("Error in checkWorkspaceRole:", error);
      setManagerData(null);
      setIsManager(false);
      setWorkspaceRole("assignedWorkspace");
    }
  };

  // handle moving a task to trash
  const handleTrashTask = async (taskId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        toast.error("User not logged in", { position: "top-right" });
        return;
      }

      const response = await fetch(
        `https://task-up.up.railway.app/tasks/${taskId}/trash`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceId: workspacedId,
            userId: userData.userId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove task from the current view
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        toast.success(data.message || "Task moved to trash", {
          position: "top-right",
        });
      } else {
        toast.error(data.message || "Failed to move task to trash", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error moving task to trash:", error);
      toast.error("Network error. Please try again.", {
        position: "top-right",
      });
    }
  };

  const fetchBoard = async (workspaceId) => {
    localStorage.setItem("lastMainTab", "Board");
    try {
      setIsLoading(true);

      const response = await fetch(
        `https://task-up.up.railway.app/board/${workspaceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Process tasks and add initials/bgColor on frontend
        const tasks = data.task.tasks.map((taski) => ({
          ...taski,
          id: taski.id,
          status: taski.status,
          title: taski.title,
          description: taski.description,
          priority: taski.priority,
          backgroundGradient: "bg-gradient-to-br from-pink-300 to-blue-400",
          assignedTo: taski.assignedTo.map((user) => ({
            ...user,
            initials: getInitials(user.name),
            bgColor: getAvatarColor(user.id),
          })),
          dueDate: taski.dueDate,
        }));

        // Process members and add initials/bgColor on frontend
        const members = data.task.user.map((useri) => ({
          ...useri,
          id: useri.id,
          name: useri.name,
          email: useri.email,
          photoPath: useri.photoPath || null,
          initials: getInitials(useri.name),
          bgColor: getAvatarColor(useri.id),
        }));

        setMembers([...members]);
        setTasks([...tasks]);
      } else {
        toast.error(data.message || "Get into workspace fail", {
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

  const refreshBoard = () => {
    fetchBoard(workspacedId);
  };

  useEffect(() => {
    fetchBoard(workspacedId);
    checkWorkspaceRole(workspacedId);
  }, [workspacedId, refreshKey]);

  // Function to filter tasks by both status and priority
  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Filter by status
    if (activeFilter !== "ALL") {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === activeFilter
      );
    }

    // Filter by priority
    if (priorityFilter !== "ALL") {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priorityFilter
      );
    }

    return filteredTasks;
  };

  const handleTaskCreated = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    closeTaskForm();
  };

  const openTaskForm = () => {
    setIsTaskFormOpen(true);
  };

  const closeTaskForm = () => {
    setIsTaskFormOpen(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      <ToastContainer
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable={false}
      />
      <div className="fixed top-0 right-0 left-0 z-20">
        <Navbar activeTab={workspaceRole} refreshBoard={refreshBoard} />
      </div>

      <div className="fixed left-0 top-16 h-screen z-10">
        <Sidebar workspaceId={workspacedId} />
      </div>

      <div className="flex-1 flex flex-col !mt-16 bg-gray-50">
        <div className="flex-1 !p-8 md:p-6 overflow-auto !ml-50">
          {/* BOARD CONTENT */}

          {/* FILTER BAR */}
          <FilterBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            isManager={isManager}
            openTaskForm={openTaskForm}
          />

          {/* TASK CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 !mt-8">
            {isLoading ? (
              <div className="col-span-3 flex justify-center items-center !py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : getFilteredTasks().length === 0 ? (
              <div className="col-span-3 text-center py-10 text-gray-500">
                No tasks found with the selected filters.{" "}
                {isManager && "Click on '+ Add task' to create a new task."}
              </div>
            ) : (
              getFilteredTasks().map((task) => (
                <Task
                  key={task.id}
                  task={task}
                  workspaceId={workspacedId}
                  onTrashTask={handleTrashTask}
                  isManager={isManager}
                  refreshBoard={refreshBoard}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* TASK FORM */}
      {isManager && (
        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={closeTaskForm}
          onSave={handleTaskCreated}
          workspaceId={workspacedId}
          members={members}
        />
      )}
    </div>
  );
};

export default Board;
