const User = require("../model/User");

exports.updatePicture = (req, res) => {
  try {
    console.log("here");
    const id = req.body.userId;
    const file = req.file;
    User.addPicToSupa(id, file, (err, result) => {
      if (err) {
        console.error("Error add file", err);
        return res.status(500).json({ error: true, message: "Error add file" });
      }
      res.status(201).json({ success: true });
    });
  } catch (e) {
    console.log(e);
  }
};

exports.userProfileControl = (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: "Cannot get UserId" });
  }

  User.findById(userId, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: "Error when find workspace!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Get user data successful",
      userInformation: result,
    });
  });
};

exports.updateUsername = (req, res) => {
  const { id, username } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ error: true, message: "Please fill in username field!" });
  }

  User.updateUserNameById(id, username, (err, user) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: "Database error",
      });
    }
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "Update successful!",
    });
  });
};

exports.changePassword = (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  // Debug logging
  console.log("changePassword called with:", { userId, currentPassword: "***", newPassword: "***" });

  // Validation
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  if (!currentPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password is required"
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters long"
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password"
    });
  }

  // Đảm bảo callback được định nghĩa đúng
  const callback = (err, result) => {
    console.log("Callback called with:", { err, result });
    
    if (err) {
      console.error("Error changing password:", err);
      return res.status(500).json({
        success: false,
        message: "Database error occurred"
      });
    }

    if (!result || !result.success) {
      return res.status(400).json({
        success: false,
        message: result ? result.message : "Unknown error occurred"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  };

  // Gọi method changePassword từ User model với callback đã định nghĩa
  console.log("Calling User.changePassword...");
  User.changePassword(userId, currentPassword, newPassword, callback);
};