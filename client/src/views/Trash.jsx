import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import TrashBin from "../component/trash/TrashBin";

const Trash = () => {
  const { workspacedId } = useParams();
  const [trashTask, setTrashTask] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceRole, setWorkspaceRole] = useState(null);
  const [isManager, setIsManager] = useState(false);

  // check if user is admin
  const checkWorkspaceRole = async (workspaceId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        return;
      }

      const response = await fetch("https://task-up.up.railway.app/checkWorkspaceRole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.userId,
          workspaceId: workspaceId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const isUserManager = data.isManager;
        setIsManager(isUserManager);
        setWorkspaceRole(isUserManager ? "myWorkspace" : "assignedWorkspace");
      }
    } catch (error) {
      console.error("Error checking workspace role:", error);
    }
  };

  const fetchTrashtask = async (workspacedId) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://task-up.up.railway.app/workspaces/${workspacedId}/trash`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        const trashTasks = data.data.tasks.map((row) => ({
          id: row.id,
          taskname: row.taskname,
          priority: row.priority,
          StateCompletion: row.StateCompletion,
        }));

        setTrashTask(trashTasks);
      } else {
        toast.error(data.message || "Failed to get trash tasks", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error fetching trash tasks:", error);
      toast.error("Network error. Please try again.", {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashtask(workspacedId);
    checkWorkspaceRole(workspacedId);
  }, [workspacedId]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="fixed top-0 right-0 left-0 z-20">
        <Navbar activeTab={workspaceRole} />
      </div>

      <div className="fixed left-0 top-16 h-screen z-10">
        <Sidebar workspaceId={workspacedId} />
      </div>

      <div className="flex-1 flex flex-col !mt-16 bg-gray-50">
        <div className="flex-1 !p-8 md:p-6 overflow-auto !ml-50">
          {/* TRASH BIN */}
          <TrashBin
            trashTask={trashTask}
            workspaceId={workspacedId}
            isManager={isManager}
          />
        </div>
      </div>
    </div>
  );
};

export default Trash;
