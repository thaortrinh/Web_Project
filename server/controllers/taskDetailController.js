const Task = require("../model/Task");

exports.getTask = (req, res) => {
  const { taskId, workspaceId } = req.body;

  if (!taskId) {
    return res
      .status(400)
      .json({ success: false, message: "taskId is required!" });
  }

  Task.getTaskDetail(taskId, workspaceId)
    .then(task => {
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(200).json({
        success: true,
        task: task,
      });
    })
    .catch(err => {
      console.error("Error fetching task:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
};

exports.updateTask = (req, res) => {
  const { newTask, originalTask } = req.body;
  
  if (!newTask || !originalTask) {
    return res.status(400).json({
      success: false,
      message: "newTask and originalTask are required!"
    });
  }

  Task.updateTask(newTask, originalTask, (err, result) => {
    if (err) {
      console.error("Error updating task:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Task updated successfully"
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to update task",
      });
    }
  });
};