const Task = require("../model/Task");

exports.addTask = (req, res) => {
  const {
    taskname,
    description,
    workspaceId,
    StateCompletion,
    priority,
    dateBegin,
    dateEnd,
    assignedTo,
  } = req.body;

  console.log("Received file:", req.file);
  console.log("Received body:", req.body);

  // Parse assignedTo nếu nó là string (từ FormData)
  let parsedAssignedTo = assignedTo;
  if (typeof assignedTo === 'string') {
    try {
      parsedAssignedTo = JSON.parse(assignedTo);
    } catch (e) {
      console.error('Error parsing assignedTo:', e);
      parsedAssignedTo = [];
    }
  }

  const TaskData = {
    taskname,
    description,
    workspaceId,
    StateCompletion,
    priority,
    dateBegin,
    dateEnd,
    assignedTo: parsedAssignedTo,
    file: req.file, // File từ multer
  };

  Task.createTask(TaskData, (err, result) => {
    if (err) {
      console.error("Error creating task", err);
      return res
        .status(500)
        .json({ error: true, message: "Error creating task" });
    }

    res.status(201).json({ 
      success: true, 
      taskId: result.id,
      message: "Task created successfully" 
    });
  });
};

// exports.addFile giữ nguyên
exports.addFile = (req, res) => {
  try {
    const id = req.body.taskId;
    const file = req.file;
    Task.addFileToSupa(id, file, (err, result) => {
      if (err) {
        console.error("Error add file", err);
        return res.status(500).json({ error: true, message: "Error add file" });
      }
      res.status(201).json({ success: true });
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: true, message: "Server error" });
  }
};