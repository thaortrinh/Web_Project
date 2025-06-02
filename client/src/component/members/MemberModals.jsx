import React, { useState } from "react";

// Delete Confirmation Modal
export const DeleteConfirmModal = ({ member, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 !z-50 flex items-center justify-center">
      {/* Darker backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onCancel}></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-md !p-6 w-[450px] text-center max-w-[95%] mx-auto !z-10">
        {/* Warning icon - red triangle with exclamation */}
        <div className="flex justify-center items-center !mb-4">
          <svg
            className="!w-12 !h-12 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L1 21h22L12 2z" />
            <path
              d="M12 16v.01M12 8v5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Delete header - all caps, red text */}
        <h2 className="text-xl font-bold text-red-500 !mb-4">DELETE</h2>

        {/* Message - darker text, centered */}
        <p className="text-gray-700 !mb-2">
          Are you sure to delete member <br />
          <span className="text-red-500 font-semibold">
            {member?.name} ({member?.email})
          </span>
          ?
        </p>

        {/* Subtext - smaller, lighter gray */}
        <p className="text-gray-500 text-sm !mb-6">
          This action cannot be undone.
        </p>

        {/* Buttons - side by side with matching style to image */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="!px-5 !py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-medium cursor-pointer"
            disabled={isLoading}
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            className="!px-6 !py-2 bg-blue-400 text-white rounded hover:bg-blue-800 transition-colors font-medium cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-4 w-4 !mr-2 border-t-2 border-white rounded-full"></span>
                Deleting...
              </span>
            ) : (
              "DELETE"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Member Modal
export const AddMemberModal = ({ onAdd, onCancel }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!email.trim()) return;

    setIsLoading(true);
    const success = await onAdd(email, role);
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 !z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel}></div>

      <div className="relative bg-white rounded-lg shadow-md w-full max-w-md !p-6 !z-10">
        <h3 className="text-2xl font-bold text-gray-800 !mb-6">
          Add new member
        </h3>
        <div className="!mb-4">
          <label className="block text-sm text-gray-600 !mb-1">
            Email address
          </label>
          <input
            type="email"
            className="w-full border rounded-md !px-3 !py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="!mb-6">
          <label className="block text-sm text-gray-600 !mb-1">Role</label>
          <input
            type="text"
            className="w-full border rounded-md !px-3 !py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Member role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            className="!px-5 !py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-medium cursor-pointer"
            onClick={onCancel}
            disabled={isLoading}
          >
            CANCEL
          </button>
          <button
            className="!px-6 !py-2 bg-blue-400 text-white rounded hover:bg-blue-800 transition-colors font-medium cursor-pointer"
            onClick={handleAdd}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-4 w-4 !mr-2 border-t-2 border-white rounded-full"></span>
                Adding...
              </span>
            ) : (
              "ADD"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Update Role Modal
export const UpdateRoleModal = ({
  member,
  role,
  onRoleChange,
  onUpdate,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    await onUpdate();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 !z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel}></div>

      <div className="relative bg-white rounded-lg shadow-md w-full max-w-md !p-6 !z-10">
        <h3 className="text-2xl font-bold text-gray-800 !mb-6">
          Update Member Role
        </h3>
        <div className="!mb-2">
          <p className="text-gray-600">
            <span className="font-semibold">Member:</span> {member?.name}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Email:</span> {member?.email}
          </p>
        </div>
        <div className="!mb-6">
          <label className="block ext-gray-600 !mb-1">Role</label>
          <input
            type="text"
            className="w-full border rounded-md !px-3 !py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Member role"
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            className="!px-5 !py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-medium cursor-pointer"
            onClick={onCancel}
            disabled={isLoading}
          >
            CANCEL
          </button>
          <button
            className="!px-6 !py-2 bg-blue-400 text-white rounded hover:bg-blue-800 transition-colors font-medium cursor-pointer"
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-4 w-4 !mr-2 border-t-2 border-white rounded-full"></span>
                Updating...
              </span>
            ) : (
              "UPDATE"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
