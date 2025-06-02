import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const ChangePasswordModal = ({ isOpen, onClose, userData }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Real-time validation for confirm password
    if (name === "confirmPassword" && formData.newPassword) {
      if (value !== formData.newPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }

    // Real-time validation for new password matching with confirm
    if (name === "newPassword" && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if new password is different from current password
    if (formData.currentPassword && formData.newPassword) {
      if (formData.currentPassword === formData.newPassword) {
        newErrors.newPassword =
          "New password must be different from current password";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Changing password...", {
      position: "top-right",
      pauseOnHover: false,
      closeOnClick: false,
      autoClose: false,
    });

    try {
      const response = await axios.post(
        "https://task-up.up.railway.app/changePassword",
        {
          userId: userData.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );

      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success("Password changed successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        // Reset form and close modal
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
        onClose();
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.data.message || "Failed to change password", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data.message || "Error changing password";
        toast.error(errorMessage, {
          position: "top-right",
        });

        // If current password is incorrect, show error on the field
        if (
          error.response.status === 400 &&
          errorMessage.toLowerCase().includes("current password")
        ) {
          setErrors({
            currentPassword: "Current password is incorrect",
          });
        }
      } else if (error.request) {
        toast.error("Unable to connect to server. Please try again later.", {
          position: "top-right",
        });
      } else {
        toast.error("Error changing password: " + error.message, {
          position: "top-right",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Don't allow closing while loading

    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Darker backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleClose}></div>

      {/* Form content */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md !p-8 !z-10">
        <h2 className="text-2xl font-bold !mb-6 text-gray-900">
          Change Password
        </h2>

        <div className="flex flex-col !gap-y-4">
          {/* Current Password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 !mb-2"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                className={`w-full !px-3 !py-2.5 !pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                  errors.currentPassword
                    ? "border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                }`}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute !inset-y-0 right-0 !pr-3 flex items-center hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPasswords.current ? (
                  <Eye size={20} className="text-gray-500" />
                ) : (
                  <EyeOff size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 !mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className={`w-full !px-3 !py-2.5 !pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                  errors.newPassword
                    ? "border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                }`}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute !inset-y-0 right-0 !pr-3 flex items-center hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPasswords.new ? (
                  <Eye size={20} className="text-gray-500" />
                ) : (
                  <EyeOff size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 !mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter new password"
                className={`w-full !px-3 !py-2.5 !pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-400 ${
                  errors.confirmPassword
                    ? "border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                }`}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute !inset-y-0 right-0 !pr-3 flex items-center hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPasswords.confirm ? (
                  <Eye size={20} className="text-gray-500" />
                ) : (
                  <EyeOff size={20} className="text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 !mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="!px-6 !py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="!px-6 !py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
