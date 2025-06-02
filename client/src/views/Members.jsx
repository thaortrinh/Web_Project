import React, { useEffect, useState } from "react";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import ManageMembers from "../component/members/ManageMembers";
import { useParams } from "react-router-dom";

const Members = () => {
    const { workspacedId } = useParams();
    const [workspaceRole, setWorkspaceRole] = useState(null);
    
    // Function to check workspace role
    const checkWorkspaceRole = async (workspaceId) => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            if (!userData) {
                return;
            }

            const response = await fetch("https://task-up.up.railway.app/checkWorkspaceRole", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userData.userId,
                    workspaceId: workspaceId
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setWorkspaceRole(data.isManager ? "myWorkspace" : "assignedWorkspace");
            }
        } catch (error) {
            console.error("Error checking workspace role:", error);
        }
    };
    
    useEffect(() => {
        checkWorkspaceRole(workspacedId);
    }, [workspacedId]);
    
    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="fixed top-0 right-0 left-0 z-20">
                <Navbar activeTab={workspaceRole} />
            </div>

            <div className="fixed left-0 top-16 h-screen z-10">
                <Sidebar workspaceId={workspacedId} />
            </div>

            <div className="flex-1 flex flex-col !mt-15 bg-gray-50">
                <div className="flex-1 !p-8 md:p-6 overflow-auto !ml-50">
                    {/* MANAGE TEAM MEMBERS */}
                    <ManageMembers />
                </div>
            </div>
        </div>
    );
}

export default Members;