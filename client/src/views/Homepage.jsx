import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";
import AddWorkspaceForm from "../component/homepage/AddWorkspaceForm";
import WorkspaceCard from "../component/homepage/WorkspaceCard";

const Homepage = () => {
  const [isAddWorkspaceFormOpen, setAddWorkspaceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("myWorkspace");
  const [userId, setUserId] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetch workspace
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      let userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) {
        toast.error("User not found in localStorage", {
          position: "top-right",
        });
        setLoading(false);
        return;
      }

      setUserId(userData.userId);

      // Fetch workspaces from API - only for the specific userId
      const response = await fetch("https://task-up.up.railway.app/getWorkSpace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Process managed workspaces
        const managedWorkspaces = data.managedWorkspaces.map((workspace) => ({
          ...workspace,
          id: workspace.id,
          title: workspace.workspaceName,
          subtitle: `Created on ${new Date(
            workspace.dateCreate
          ).toLocaleDateString()}`,
          backgroundGradient: "bg-gradient-to-br from-pink-300 to-blue-400",
          members: workspace.members,
          isOwner: true,
          isPending: false, // Admin/owner is never pending
        }));

        // Process assigned workspaces and filter out pending ones
        const assignedWorkspaces = data.assignedWorkspaces
          .map((workspace) => {

            // Convert isPending to a proper boolean
            // This handles cases where isPending is 1, "1", true, or any other truthy value
            const isPendingStatus = Boolean(
              workspace.isPending === 1 ||
                workspace.isPending === "1" ||
                workspace.isPending === true
            );

            return {
              ...workspace,
              id: workspace.id,
              title: workspace.workspaceName,
              description: workspace.description || "",
              backgroundGradient:
                "bg-gradient-to-br from-blue-300 to-purple-400",
              members: workspace.members,
              isOwner: false,
              isPending: isPendingStatus,
            };
          })
          .filter((workspace) => !workspace.isPending);

        setWorkspaces([...managedWorkspaces, ...assignedWorkspaces]);
      } else {
        toast.error(data.message || "Failed to fetch workspaces", {
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

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleAddWorkspace = () => {
    setAddWorkspaceOpen(true);
  };

  const handleCloseAddWorkspace = () => {
    setAddWorkspaceOpen(false);
  };

  const handleWorkspaceClick = (workspaceId) => {
    navigate(`/dashboard/${workspaceId}`);
  };

  const handleAddNewWorkspace = () => {
    fetchWorkspaces();
  };

  const handleUpdateWorkspace = async (updatedWorkspace) => {
    try {
      const workspaceIndex = workspaces.findIndex(
        (ws) => ws.id === updatedWorkspace.id
      );

      if (workspaceIndex !== -1) {
        // Create a new array with the updated workspace
        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces[workspaceIndex] = {
          ...updatedWorkspaces[workspaceIndex],
          title: updatedWorkspace.title,
          description: updatedWorkspace.description,
        };

        setWorkspaces(updatedWorkspaces);
      }
    } catch (error) {
      toast.error(
        "Error updating workspace in state: " +
          (error.message || "Unknown error"),
        {
          position: "top-right",
        }
      );
    }
  };

  // Filter workspaces based on active tab
  const filteredWorkspaces = workspaces.filter((workspace) => {
    if (activeTab === "myWorkspace") {
      return workspace.isOwner;
    } else {
      return !workspace.isOwner;
    }
  });

  const displayedWorkspaces = filteredWorkspaces;

  const refreshWorkspaces = async () => {
    await fetchWorkspaces();
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f4f7fa]">
      <div className="fixed top-0 right-0 left-0 z-20">
        <ToastContainer
          pauseOnFocusLoss={false}
          pauseOnHover={false}
          draggable={false}
        />
        <Navbar
          workspaces={workspaces}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          refreshWorkspaces={refreshWorkspaces}
        />
      </div>

      <div className="flex justify-center w-full !my-24">
        {/* Homepage content */}
        <div className="w-full max-w-6xl">
          <div className="flex justify-between items-center !mb-6">
            <h1 className="text-3xl font-bold text-indigo-900">
              {activeTab === "myWorkspace"
                ? "My Workspaces"
                : "My Assigned Workspaces"}
            </h1>
            {activeTab === "myWorkspace" && (
              <button
                onClick={handleAddWorkspace}
                className="bg-blue-400 hover:bg-blue-900 text-white rounded-md font-medium !px-4 !py-2"
              >
                Add Workspace
              </button>
            )}
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="w-full text-center py-8 text-gray-500">
              <div className=" text-gray-500">Loading workspaces...</div>
            </div>
          ) : (
            /* Workspace cards grid */
            <div className="flex flex-wrap gap-6">
              {displayedWorkspaces.length > 0 ? (
                displayedWorkspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    onClick={() => handleWorkspaceClick(workspace.id)}
                    onUpdate={handleUpdateWorkspace}
                    onFetchWorkspaces={fetchWorkspaces}
                  />
                ))
              ) : (
                <div className="w-full text-center py-8 text-gray-500">
                  {activeTab === "myWorkspace"
                    ? "You don't have any workspaces yet. Create one to get started!"
                    : "You're not assigned to any workspaces."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddWorkspaceForm
        isOpen={isAddWorkspaceFormOpen}
        onClose={handleCloseAddWorkspace}
        onAdd={handleAddNewWorkspace}
      />
    </div>
  );
};

export default Homepage;