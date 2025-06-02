const Task = require("../model/Task");
const WorkSpace = require("../model/WorkSpace");

// Move task to trash (PATCH method)
exports.moveTaskToTrash = (req, res) => {
  const { taskId } = req.params;
  const { workspaceId, userId } = req.body;

  // Validate required parameters
  if (!taskId) {
    return res.status(400).json({
      success: false,
      message: "Task ID is required in URL parameters",
    });
  }

  if (!workspaceId || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: workspaceId and userId",
    });
  }

  // Check if user is manager of that workspace
  WorkSpace.checkUserRole(userId, workspaceId, (roleErr, roleResult) => {
    if (roleErr) {
      console.error("Error checking workspace role:", roleErr);
      return res.status(500).json({
        success: false,
        message: "Internal server error while checking permissions",
        error:
          process.env.NODE_ENV === "development" ? roleErr.message : undefined,
      });
    }

    if (!roleResult.found) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this workspace",
      });
    }

    // Only managers can trash tasks
    if (!roleResult.isManager) {
      return res.status(403).json({
        success: false,
        message:
          "Insufficient permissions. Only workspace managers can move tasks to trash",
      });
    }

    // Move task to trash
    Task.moveToTrash(taskId, (err, result) => {
      if (err) {
        console.error("Error moving task to trash:", err);

        // Handle specific error cases
        if (err.message === "Task not found") {
          return res.status(404).json({
            success: false,
            message: "Task not found or already deleted",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to move task to trash",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }

      res.status(200).json({
        success: true,
        message: "Task successfully moved to trash",
        data: {
          taskId: taskId,
          trashedAt: new Date().toISOString(),
        },
      });
    });
  });
};

// Get trash tasks for a workspace (GET method)
exports.getTrashTasksByWorkspace = (req, res) => {
  const { workspaceId } = req.params; // Get from URL params

  // Validate required parameter
  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      message: "Workspace ID is required in URL parameters",
    });
  }

  // Optional: Add user permission check if needed
  // You might want to verify if the user has access to this workspace

  Task.getTrashTasks(workspaceId, (err, result) => {
    if (err) {
      console.error("Error retrieving trash tasks:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve trash tasks",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }

    // Transform data to match frontend expectations
    const transformedTasks = result.map((row) => ({
      id: row.TaskId,
      taskname: row.taskname,
      priority: row.priority,
      StateCompletion: row.StateCompletion,
    }));

    return res.status(200).json({
      success: true,
      message: "Trash tasks retrieved successfully",
      data: {
        workspaceId: workspaceId,
        tasks: transformedTasks,
        count: transformedTasks.length,
        retrievedAt: new Date().toISOString(),
      },
    });
  });
};

exports.restoreTrashTask = (req, res) => {
  const { taskId, workspaceId, userId } = req.body;

  if (!taskId) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot get taskId" });
  }

  // Check if the user has permission to modify tasks in this workspace
  if (workspaceId && userId) {
    WorkSpace.checkUserRole(userId, workspaceId, (roleErr, roleResult) => {
      if (roleErr) {
        console.error("Error checking workspace role:", roleErr);
        return res.status(500).json({
          success: false,
          message: "Error checking workspace role: " + roleErr.message,
        });
      }

      if (!roleResult.found) {
        return res.status(404).json({
          success: false,
          message: "User not part of this workspace",
        });
      }

      // Only managers can restore tasks
      if (!roleResult.isManager) {
        return res.status(403).json({
          success: false,
          message: "Only workspace managers can restore tasks from trash",
        });
      }

      Task.restoreFromTrash(taskId, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error when restoring task!",
          });
        }
        res.status(200).json({ success: true });
      });
    });
  } else {
    Task.restoreFromTrash(taskId, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error when restoring task!",
        });
      }
      res.status(200).json({ success: true });
    });
  }
};

exports.permanentlyDeleteTask = (req, res) => {
  const { taskId, workspaceId, userId } = req.body;

  if (!taskId) {
    return res
      .status(400)
      .json({ success: false, message: "Cannot get taskId" });
  }

  // Check if the user has permission to modify tasks in this workspace
  if (workspaceId && userId) {
    WorkSpace.checkUserRole(userId, workspaceId, (roleErr, roleResult) => {
      if (roleErr) {
        console.error("Error checking workspace role:", roleErr);
        return res.status(500).json({
          success: false,
          message: "Error checking workspace role: " + roleErr.message,
        });
      }

      if (!roleResult.found) {
        return res.status(404).json({
          success: false,
          message: "User not part of this workspace",
        });
      }

      // Only managers can permanently delete tasks
      if (!roleResult.isManager) {
        return res.status(403).json({
          success: false,
          message: "Only workspace managers can permanently delete tasks",
        });
      }

      Task.permanentlyDelete(taskId, (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error when permanently deleting task!",
          });
        }
        res.status(200).json({ success: true });
      });
    });
  } else {
    Task.permanentlyDelete(taskId, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error when permanently deleting task!",
        });
      }
      res.status(200).json({ success: true });
    });
  }
};
