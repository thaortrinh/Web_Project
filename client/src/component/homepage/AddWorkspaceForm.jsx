import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddWorkspaceForm = ({ isOpen, onClose, onAdd }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const getUserId = () => {
      let data = JSON.parse(localStorage.getItem("user"));
      if (data && data.userId) {
        setUserId(data.userId);
      }
    };

    getUserId();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setWorkspaceName("");
      setDescription("");
      setErrors({});
    }
  }, [isOpen]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Workspace name validation
    if (!workspaceName.trim()) {
      newErrors.workspaceName = "Workspace name is required";
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWorkspaceNameChange = (e) => {
    const value = e.target.value;
    setWorkspaceName(value);

    // Clear error when user starts typing
    if (errors.workspaceName) {
      setErrors({
        ...errors,
        workspaceName: "",
      });
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);

    // Clear error when user starts typing
    if (errors.description) {
      setErrors({
        ...errors,
        description: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly", {
        position: "top-right",
      });
      return;
    }

    if (!userId) {
      toast.error("User information not found. Please log in again.", {
        position: "top-right",
      });
      return;
    }

    const dateCreate = new Date().toISOString().split("T")[0];

    setLoading(true);

    try {
      const response = await axios.post("https://task-up.up.railway.app/addWorkSpace", {
        workspacename: workspaceName.trim(),
        description: description.trim(),
        dateCreate: dateCreate,
        userId: userId,
      });

      const result = response.data;

      if (result.success || result.id) {
        toast.success("Workspace created successfully!", {
          position: "top-right",
        });

        // Pass the workspace data to the parent component
        onAdd(result);

        // Reset form fields
        setWorkspaceName("");
        setDescription("");
        setErrors({});

        // Close the modal
        onClose();
      } else {
        toast.error("Failed to create workspace", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(
        "Error creating workspace: " +
          (error.response ? error.response.data.message : error.message),
        {
          position: "top-right",
        }
      );
      console.error("Error creating workspace:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWorkspaceName("");
    setDescription("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !z-50 flex items-center justify-center">
      {/* Darker backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleClose}></div>

      {/* Form content */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md !p-8 !z-10">
        <div className="flex justify-between items-center !mb-4">
          <h2 className="text-2xl font-bold">Add new Workspace</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="!mb-4">
            <label htmlFor="name" className="block font-medium !mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="Workspace name"
              className={`w-full !p-2 border rounded-md focus:outline-none focus:border-1 ${
                errors.workspaceName
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-[#6299ec]"
              }`}
              value={workspaceName}
              onChange={handleWorkspaceNameChange}
              maxLength={50}
            />
            {errors.workspaceName && (
              <p className="text-red-500 text-xs !mt-1">{errors.workspaceName}</p>
            )}
          </div>

          <div className="!mb-6">
            <label htmlFor="description" className="block font-medium !mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              placeholder="Workspace description"
              className={`w-full !p-2 border rounded-md focus:outline-none focus:border-1 ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-[#6299ec]"
              }`}
              rows="4"
              value={description}
              onChange={handleDescriptionChange}
            />
            {errors.description && (
              <p className="text-red-500 text-xs !mt-1">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end gap-5">
            <button
              type="button"
              onClick={handleClose}
              className="!px-7 !py-2 text-[#6299ec] font-medium rounded-md hover:bg-gray-100 cursor-pointer"
              disabled={loading}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="!px-7 !py-2 bg-[#6299ec] text-white font-medium rounded-md hover:bg-blue-900 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "ADDING..." : "ADD"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkspaceForm;