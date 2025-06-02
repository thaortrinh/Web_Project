import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaEdit, FaCrown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getInitials, getAvatarColor } from "../../utils/avatarUtils";

import {
  fetchMembers,
  addMember,
  deleteMember,
  updateMemberRole,
  getCurrentUserRole,
} from "./membersService";
import {
  DeleteConfirmModal,
  AddMemberModal,
  UpdateRoleModal,
} from "./MemberModals";

const ManageMembers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [isAdmin, setIsAdmin] = useState(0);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false);

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberToUpdate, setMemberToUpdate] = useState(null);
  const [updatedRole, setUpdatedRole] = useState("");

  useEffect(() => {
    const storedWorkspace = JSON.parse(localStorage.getItem("workspace"));
    setWorkspace(storedWorkspace);

    if (storedWorkspace) {
      loadMembers(storedWorkspace);
      checkAdminStatus(storedWorkspace);
    } else {
      setIsLoading(false);
    }
  }, []);

  // check if current user is admin in a specific workspace
  const checkAdminStatus = async (workspace) => {
    try {
      const userRole = await getCurrentUserRole(workspace);
      setIsAdmin(userRole.isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(0);
    }
  };

  const loadMembers = async (workspace) => {
    setIsLoading(true);
    try {
      const data = await fetchMembers(workspace);
      if (data.success) {
        const processedMembers = data.members.map((member) => ({
          ...member,
          name: String(member.userName || member.name)
            .replace(/\d+$/, "")
            .trim(),
        }));
        setMembers(processedMembers);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (member) => {
    // only admin can delete
    if (isAdmin !== 1) {
      toast.error("Only admin can delete.", {
        position: "top-right",
      });
      return;
    }

    setMemberToDelete(member);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isAdmin !== 1) {
      toast.error("Only admin can delete.", { position: "top-right" });
      return;
    }

    const success = await deleteMember(memberToDelete, members, setMembers);
    if (success) {
      setShowConfirm(false);
      setMemberToDelete(null);
    }
  };

  const handleUpdateRoleClick = (member) => {
    // only admin can update member role
    if (isAdmin !== 1) {
      toast.error("Only admin can update member's role.", {
        position: "top-right",
      });
      return;
    }

    setMemberToUpdate(member);
    setUpdatedRole(member.role);
    setShowUpdateRoleModal(true);
  };

  const handleConfirmUpdateRole = async () => {
    if (isAdmin !== 1) {
      toast.error("Only admin can do", { position: "top-right" });
      return;
    }

    if (!updatedRole.trim()) {
      toast.error("Role cannot be empty");
      return;
    }

    const success = await updateMemberRole(
      memberToUpdate,
      updatedRole,
      members,
      setMembers
    );

    if (success) {
      setShowUpdateRoleModal(false);
      setMemberToUpdate(null);
    }
  };

  const handleAddClick = () => {
    if (!workspace) {
      toast.error("Please create a workspace first");
      return;
    }

    // Only admin can add new member
    if (isAdmin !== 1) {
      toast.error("Only admin can add new member.", {
        position: "top-right",
      });
      return;
    }

    setShowAddModal(true);
  };

  const handleAddMember = async (email, role) => {
    if (isAdmin !== 1) {
      toast.error("Only admin can add new member.", { position: "top-right" });
      return false;
    }

    const result = await addMember(email, role, workspace, members, setMembers);

    if (result === true) {
      setShowAddModal(false);

      // Refetch members list immediately after successful add
      await loadMembers(workspace);

      return true;
    } else if (result && result.userNotFound) {
      // Show toast instead of modal for user not found
      toast.error(`User with email "${email}" not found. Please check the email address.`, {
        position: "top-right",
        autoClose: 5000,
      });
      return false;
    }
    return false;
  };

  const getSortedMembers = () => {
    if (!members || members.length === 0) return [];

    return [...members].sort((a, b) => {
      // Admin (isManager = 1) is put at first row
      if (a.isManager === 1 && b.isManager !== 1) return -1;
      if (a.isManager !== 1 && b.isManager === 1) return 1;
      // if same manager role -> arrange name based on name order
      return a.name.localeCompare(b.name);
    });
  };

  return (
    <div className="bg-[#f7f8fc] min-h-screen relative">
      <ToastContainer
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable={false}
      />

      {/* Header */}
      <div className="flex justify-between items-center !mb-6">
        <h1 className="text-xl font-bold text-[#455294]">Team Members</h1>
        <div className="flex gap-2">
          {/* Admin -> show Add member button */}
          {isAdmin === 1 && (
            <button
              className="bg-blue-400 hover:bg-blue-900 text-white !py-2 !px-4 rounded-md text-sm font-medium cursor-pointer"
              onClick={handleAddClick}
            >
              + Add member
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : workspace ? (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="!py-4 !px-8 text-left font-semibold">Name</th>
                <th className="!py-4 !px-8 text-left font-semibold">
                  Email address
                </th>
                <th className="!py-4 !px-8 text-left font-semibold">Role</th>
                <th className="!py-4 !px-8 text-left font-semibold">Status</th>
                {isAdmin === 1 && (
                  <th className="!py-4 !px-8 text-center font-semibold">
                    Delete
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {getSortedMembers().map((member, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-200 hover:bg-gray-50 ${
                    member.isManager === 1 ? "bg-gray-50" : ""
                  }`}
                >
                  {/* Name */}
                  <td className="!py-4 !px-8 text-gray-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold ${getAvatarColor(
                          member.userId
                        )}`}
                      >
                        {member.photoPath ? (
                          <img
                            src={member.photoPath}
                            alt={member.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          getInitials(String(member.name))
                        )}
                      </div>

                      <span className=" text-[#111827] font-medium">
                        {String(member.name)}
                        {member.isManager === 1 ? (
                          <span className="!ml-2 text-yellow-500 inline-block">
                            <FaCrown size={14} />
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="!py-4 !px-8 text-gray-700">
                    {member.isManager === 1 ? (
                      <span className="text-[#111827]">{member.email}</span>
                    ) : (
                      member.email
                    )}
                  </td>

                  {/* Role with Edit button */}
                  <td className="!py-4 !px-8 text-gray-700">
                    <div className="flex items-center gap-2">
                      {member.isManager === 1 ? (
                        <span className="text-[#455294] font-semibold">
                          Admin
                        </span>
                      ) : (
                        <>
                          {/* Admin -> show edit button */}
                          {isAdmin === 1 ? (
                            <button
                              className="text-blue-600 hover:scale-130 transition cursor-pointer"
                              onClick={() => handleUpdateRoleClick(member)}
                              title="Edit Role"
                            >
                              <FaEdit size={14} />
                            </button>
                          ) : null}
                          <span>{String(member.role)}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Status column */}
                  <td className="!py-4 !px-8 text-gray-700">
                    {member.isPending === 1 ? (
                      <span className="!px-2 !py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    ) : (
                      <span className="!px-2 !py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Delete button */}
                  {isAdmin === 1 && (
                    <td className="!py-4 !px-8 text-center">
                      {member.isManager !== 1 && (
                        <button
                          className="text-red-600 hover:scale-110 transition cursor-pointer"
                          onClick={() => handleDeleteClick(member)}
                          title="Delete Member"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin === 1 ? "5" : "4"}
                    className="!py-16 text-center text-gray-400"
                  >
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Modals */}
      {showConfirm && (
        <DeleteConfirmModal
          member={memberToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowConfirm(false);
            setMemberToDelete(null);
          }}
        />
      )}

      {showAddModal && (
        <AddMemberModal
          onAdd={handleAddMember}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showUpdateRoleModal && (
        <UpdateRoleModal
          member={memberToUpdate}
          role={updatedRole}
          onRoleChange={(value) => setUpdatedRole(value)}
          onUpdate={handleConfirmUpdateRole}
          onCancel={() => {
            setShowUpdateRoleModal(false);
            setMemberToUpdate(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageMembers;