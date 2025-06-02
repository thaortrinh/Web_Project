// Fetch user's pending invitations
export const fetchUserInvitations = async (userId) => {
  try {
    const response = await fetch(
      "https://task-up.up.railway.app/getUserInvitations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await response.json();

    if (data.success) {
      return { success: true, notifications: data.invitations };
    } else {
      console.error("Failed to fetch invitations:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return { success: false, message: error.message };
  }
};

// Respond to a workspace invitation (accept or decline)
export const respondToInvitation = async (joinWorkSpace, accept) => {
  try {
    const response = await fetch(
      "https://task-up.up.railway.app/respondToInvitation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joinWorkSpace, accept }),
      }
    );

    const data = await response.json();

    if (data.success) {
      return { success: true, message: data.message };
    } else {
      console.error("Failed to respond to invitation:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error responding to invitation:", error);
    return { success: false, message: error.message };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  return { success: true };
};

export const markAllNotificationsAsRead = async (userId) => {
  return { success: true };
};
