import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.png";
import WorkspaceTabs from "./homepage/WorkspaceTabs";
import UserAvatar from "./profile/UserAvatar";

import NotificationDropdown from "./noti/NotificationDropdown";

const Navbar = ({ workspaces, activeTab, onTabChange, refreshWorkspaces }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const workspaceId = params.workspacedId;
  const [highlightedTab, setHighlightedTab] = useState(activeTab);

  // Check if user is manager of current workspace
  useEffect(() => {
    if (location.pathname.includes("/dashboard/") && workspaceId) {
      checkWorkspaceRole(workspaceId);
    } else {
      // If not on dashboard, use the activeTab prop
      setHighlightedTab(activeTab);
    }
  }, [location.pathname, workspaceId, activeTab]);

  // check if current user is a manager of this workspace
  const checkWorkspaceRole = async (workspaceId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData) return;

      const response = await fetch(
        "https://task-up.up.railway.app/checkWorkspaceRole",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData.userId,
            workspaceId: workspaceId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Set tab based on isManager value
        setHighlightedTab(data.isManager ? "myWorkspace" : "assignedWorkspace");
      }
    } catch (error) {
      console.error("Error checking workspace role:", error);
    }
  };

  const handleTabChange = (tabId) => {
    navigate("/homepage");

    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <div className="flex items-center justify-between !px-4 !py-4 bg-white border-b border-gray-200 w-full">
      {/* Logo and Tabs */}
      <div className="flex items-center gap-3 cursor-pointer">
        <img
          src={logo}
          alt="Logo"
          className="w-8 h-8 object-contain"
          onClick={() => navigate("/homepage")}
        />
        <h2
          className="text-xl bg-gradient-to-r from-[#435090] to-[#3885c4] text-transparent bg-clip-text inline-block font-bold"
          onClick={() => navigate("/homepage")}
        >
          TaskUP
        </h2>
      </div>

      {/* Workspace Tabs */}
      <nav className="!ml-5 flex items-center gap-10 flex-grow">
        <WorkspaceTabs
          activeTab={highlightedTab}
          onTabChange={handleTabChange}
        />
      </nav>

      {/* Noti dropdown + Avatar */}
      <div className="flex items-center gap-5">
        {/* <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="!pl-3 !pr-20 !py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div> */}

        <div className="flex items-center gap-6">
          {/* Notification Dropdown */}
          <NotificationDropdown refreshWorkspaces={refreshWorkspaces} />

          {/* Avatar */}
          <UserAvatar />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
