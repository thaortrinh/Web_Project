const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

//////////////

// Task trash operations
router.patch("/tasks/:taskId/trash", taskController.moveTaskToTrash);
router.get("/workspaces/:workspaceId/trash", taskController.getTrashTasksByWorkspace);
router.post("/restoreTrashTask", taskController.restoreTrashTask);
router.post("/permanentlyDeleteTask", taskController.permanentlyDeleteTask);

module.exports = router;
