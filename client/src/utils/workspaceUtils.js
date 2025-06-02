import axios from "axios";

// Utility function to fetch workspace manager
export const fetchWorkspaceManager = async (workspaceId) => {
  try {
    const response = await axios.post(
      "https://task-up.up.railway.app/getWorkspaceManager",
      { workspaceId }
    );

    if (response.data.success) {
      return {
        success: true,
        manager: response.data.manager,
        error: null,
      };
    } else {
      return {
        success: false,
        manager: null,
        error: "No manager found",
      };
    }
  } catch (error) {
    console.error("Error fetching workspace manager:", error);
    return {
      success: false,
      manager: null,
      error: error.message || "Failed to fetch manager",
    };
  }
};

// Utility function to check if user is manager
export const checkIsUserManager = (managerData) => {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (!userData || !managerData) {
    return false;
  }

  return userData.userId === managerData.userId;
};

// Combined utility function
export const fetchManagerAndCheckRole = async (workspaceId) => {
  const result = await fetchWorkspaceManager(workspaceId);

  return {
    ...result,
    isManager: result.success ? checkIsUserManager(result.manager) : false,
  };
};
