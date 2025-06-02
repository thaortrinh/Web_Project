const HomePage = require("../model/HomePage");

exports.signInHomePage = (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: "Cannot get UserId" 
    });
  }
  
  // Get workspaces where user is a manager (owner)
  HomePage.findMyWorkSpaceByUserId(userId, (err, managedWorkspaces) => {
    if (err) {
      console.error("Error fetching managed workspaces:", err);
      return res.status(500).json({
        error: true,
        message: "Error when finding managed workspaces!",
      });
    }
    
    // Get workspaces where user is assigned but not a manager
    HomePage.findMyAssignedWorkSpaceByUserId(userId, (errA, assignedWorkspaces) => {
      if (errA) {
        console.error("Error fetching assigned workspaces:", errA);
        return res.status(500).json({
          error: true,
          message: "Error when finding assigned workspaces!",
        });
      }
      console.log (assignedWorkspaces);
      console.log (managedWorkspaces);
      
      // Log data before sending to client for debugging purposes
      // console.log("Managed workspaces:", managedWorkspaces);
      // console.log("Assigned workspaces with isPending:", assignedWorkspaces);
      
      // Return both managed and assigned workspaces
      return res.status(200).json({
        success: true,
        message: "Get workspace successful",
        managedWorkspaces: managedWorkspaces,
        assignedWorkspaces: assignedWorkspaces, 
      });
    });
  });
};
