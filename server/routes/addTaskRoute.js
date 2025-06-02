const express = require("express");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});
const router = express.Router();
const addTaskController = require("../controllers/addTaskController");

router.post("/addTask", upload.single("file"), addTaskController.addTask);
router.post("/addFile", upload.single("uploaded_file"), addTaskController.addFile);

module.exports = router;