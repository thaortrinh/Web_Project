import React, { useState, useEffect } from "react";
import Sidebar from "../component/Sidebar";
import Navbar from "../component/Navbar";
import OverviewSection from "../component/dashboard/OverviewSection";
import UpcomingTaskBoard from "../component/dashboard/UpcomingTasksBoard";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [loading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({
    totalTasks: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
  });
  const [tasks, setTask] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const { workspacedId } = useParams();
  // const [UpcomingTaskBoard, setUpcomingTaskBoard] = useState();

  const fetchDashboard = async () => {
    localStorage.setItem("lastMainTab", "Dashboard");
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://task-up.up.railway.app/getDashBoard/${workspacedId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setOverviewData({
          totalTasks: data.workspace.totalTasks,
          todo: data.workspace.todo,
          inProgress: data.workspace.inProgress,
          completed: data.workspace.completed,
        });
        setTask(data.workspace.tasks);
      } else {
        toast.error(data.message || "Get into workspace fail", {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Error: " + (error.message || "Unknown error"), {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="fixed top-0 right-0 left-0 z-20">
        <Navbar />
      </div>

      <div className="fixed left-0 top-16 h-screen z-10">
        <Sidebar workspaceId={workspacedId} />
      </div>

      <div className="flex-1 flex flex-col !mt-16 bg-gray-50">
        <div className="flex-1 !p-8 md:p-6 overflow-auto !ml-50">
          {/* OVERVIEW */}
          <OverviewSection data={overviewData} />

          {/* UPCOMING TASKS */}
          <UpcomingTaskBoard tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
