const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const homePageRoute = require("./homePageRoute");
const profileRoute = require("./userProfileRoute");
const dashBoardRoute = require("./dashBoardRoute");
const workspaceRoute = require("./workspaceRoute");
const addTaskRoute = require("./addTaskRoute");
const boardRoute = require("./boardRoute");
const taskRoute = require("./taskRoute");
const memberRoute = require("./memberRoute");
const taskDetailRoute = require("./taskDetailRoute");

// Authentication and user routes
router.use("/", authRoutes);
router.use("/", homePageRoute);
router.use("/", profileRoute);

// Workspace management routes
router.use("/", workspaceRoute);

// Task and board management
router.use("/", dashBoardRoute);
router.use("/", addTaskRoute);
router.use("/", taskRoute);
router.use("/", boardRoute);
router.use("/", taskDetailRoute);

// Team/member management
router.use("/", memberRoute);

module.exports = router;
