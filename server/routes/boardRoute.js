const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");

router.get("/board/:workspaceId", boardController.getWorkSpaceBoard);

module.exports = router;