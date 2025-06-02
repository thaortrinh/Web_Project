import { toast } from "react-toastify";

// Fetch members from API
export const fetchMembers = async (workspace) => {
  try {
    if (!workspace || !workspace.WorkSpace) {
      console.error("Invalid workspace data:", workspace);
      toast.error("Workspace data is missing or invalid", {
        position: "top-right",
      });
      return { success: false };
    }

    const response = await fetch("https://task-up.up.railway.app/getMember", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspace: workspace.WorkSpace,
      }),
    });

    const data = await response.json();

    if (data.success) {
      const members = data.members.map((row) => ({
        ...row,
        name: row.userName,
        email: row.email,
        role: row.role,
        joinWorkSpace: row.joinWorkSpace,
        userId: row.userId,
        photoPath: row.photoPath,
      }));

      return { success: true, members };
    } else {
      console.error("Failed to get members:", data.message);
      toast.error(data.message || "Failed to load team members", {
        position: "top-right",
      });
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching members:", error);
    toast.error("Error: " + (error.message || "Unknown error"), {
      position: "top-right",
    });
    return { success: false };
  }
};

// Add a new member
export const addMember = async (
  email,
  role,
  workspace,
  members,
  setMembers
) => {
  if (!email.trim()) {
    toast.error("Email is required", { position: "top-right" });
    return false;
  }

  if (!workspace || !workspace.WorkSpace) {
    toast.error("Please create a workspace first", { position: "top-right" });
    return false;
  }

  try {
    // Lấy userId từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.userId) {
      toast.error("User information is missing", { position: "top-right" });
      return false;
    }

    const response = await fetch("https://task-up.up.railway.app/addMember", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        role: role || "Member",
        WorkSpace: workspace.WorkSpace,
        userId: user.userId,
      }),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      toast.error("Invalid response from server", { position: "top-right" });
      return false;
    }

    if (data.success) {
      const newMember = {
        joinWorkSpace: data.member.joinWorkSpace,
        name: data.member.userName,
        email: data.member.email,
        role: data.member.role,
        isPending: data.member.isPending,
        isManager: data.member.isManager,
        userId: data.member.userId,
      };

      setMembers([...members, newMember]);
      toast.success("Member added successfully!", { position: "top-right" });
      return true;
    } else {
      console.error("Failed to add member:", data.message || "Unknown error");

      // Check if the error is due to user not found
      if (
        data.code === "USER_NOT_FOUND" ||
        data.message.includes("not found") ||
        data.message.includes("does not exist")
      ) {
        return { userNotFound: true, email };
      } else if (data.code === "PERMISSION_DENIED") {
        toast.error("You don't have permission to add members", {
          position: "top-right",
        });
        return false;
      } else {
        toast.error(data.message || "Failed to add member", {
          position: "top-right",
        });
        return false;
      }
    }
  } catch (error) {
    console.error("Error in addMember:", error);
    toast.error("Error: " + (error.message || "Unknown error"), {
      position: "top-right",
    });
    return false;
  }
};

// Delete a member
export const deleteMember = async (memberToDelete, members, setMembers) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.userId) {
      toast.error("User information is missing", { position: "top-right" });
      return false;
    }

    const response = await fetch(
      "https://task-up.up.railway.app/deleteMember",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          joinWorkSpace: memberToDelete.joinWorkSpace,
          userId: user.userId, // check userId if admin in server
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      setMembers(
        members.filter((m) => m.joinWorkSpace !== memberToDelete.joinWorkSpace)
      );
      toast.success("Member removed successfully!", { position: "top-right" });
      return true;
    } else {
      console.error("Failed to delete member:", data.message);

      if (data.code === "PERMISSION_DENIED") {
        toast.error("You don't have permission to delete members", {
          position: "top-right",
        });
        return false;
      } else {
        toast.error(data.message || "Failed to remove member", {
          position: "top-right",
        });
        return false;
      }
    }
  } catch (error) {
    console.error("Error in deleteMember:", error);
    toast.error("Error: " + (error.message || "Unknown error"), {
      position: "top-right",
    });
    return false;
  }
};

// Update member role
export const updateMemberRole = async (
  memberToUpdate,
  updatedRole,
  members,
  setMembers
) => {
  if (!updatedRole.trim()) {
    toast.error("Role cannot be empty", { position: "top-right" });
    return false;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.userId) {
      toast.error("User information is missing", { position: "top-right" });
      return false;
    }

    const response = await fetch(
      "https://task-up.up.railway.app/updateMemberRole",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          joinWorkSpace: memberToUpdate.joinWorkSpace,
          role: updatedRole,
          userId: user.userId, // check admin role in server
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Update the member in the local state
      setMembers(
        members.map((m) =>
          m.joinWorkSpace === memberToUpdate.joinWorkSpace
            ? { ...m, role: updatedRole }
            : m
        )
      );
      toast.success("Member role updated successfully!", {
        position: "top-right",
      });
      return true;
    } else {
      console.error("Failed to update member role:", data.message);

      if (data.code === "PERMISSION_DENIED") {
        toast.error("You don't have permission to update member roles", {
          position: "top-right",
        });
        return false;
      } else {
        toast.error(data.message || "Failed to update member role", {
          position: "top-right",
        });
        return false;
      }
    }
  } catch (error) {
    console.error("Error in updateMemberRole:", error);
    toast.error("Error: " + (error.message || "Unknown error"), {
      position: "top-right",
    });
    return false;
  }
};

// check admin role
export const getCurrentUserRole = async (workspace) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.userId || !workspace || !workspace.WorkSpace) {
      return { isAdmin: 0 };
    }

    const response = await fetch(
      "https://task-up.up.railway.app/getCurrentUserRole",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          workspaceId: workspace.WorkSpace,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      return {
        isAdmin: data.isAdmin || 0,
        role: data.role || "Member",
      };
    } else {
      console.error("Failed to get user role:", data.message);
      return { isAdmin: 0 };
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    return { isAdmin: 0 };
  }
};
