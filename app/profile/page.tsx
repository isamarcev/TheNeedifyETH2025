"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "../components/layout/PageContainer";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ConnectWalletScreen } from "../components/ui/ConnectWalletScreen";
import { useWallet } from "../context/WalletContext";
import { TaskDetailsModal } from "../components/ui/TaskDetailsModal";

interface Task {
  _id: string;
  owner: string;
  title: string;
  description: string;
  asset: string;
  amount: number;
  deadline: string | null;
  executor: string | null;
  taken_at: string | null;
  owner_approved: boolean;
  executor_approved: boolean;
  category: string;
  created_at: string;
  channel_id?: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("created");
  const { isConnected, walletAddress } = useWallet();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userMetadata, setUserMetadata] = useState<{
    full_name: string;
    avatar?: string;
    forecaster_id?: string;
    forecaster_nickname?: string;
  } | null>(null);

  // Fetch user metadata
  useEffect(() => {
    async function fetchUserMetadata() {
      if (!walletAddress) return;

      try {
        const response = await fetch(`/api/users?address=${walletAddress}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user metadata");
        }
        const data = await response.json();
        setUserMetadata(data);
      } catch (err) {
        console.error("Error fetching user metadata:", err);
      }
    }

    if (isConnected && walletAddress) {
      fetchUserMetadata();
    }
  }, [isConnected, walletAddress]);

  // Fetch user tasks
  useEffect(() => {
    async function fetchUserTasks() {
      if (!walletAddress) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/tasks/user?user_address=${walletAddress}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setUserTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected && walletAddress) {
      fetchUserTasks();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, walletAddress]);

  // Filter tasks based on active tab
  const createdTasks = userTasks.filter((task) => task.owner === walletAddress);
  const workingOnTasks = userTasks.filter(
    (task) => task.executor === walletAddress
  );

  const getStatusBadge = (task: Task) => {
    let status: string;

    if (task.executor === null) {
      status = "open";
    } else if (task.owner_approved && task.executor_approved) {
      status = "completed";
    } else if (task.executor_approved) {
      status = "under_review";
    } else {
      status = "in_progress";
    }

    const statusStyles = {
      open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      completed:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      under_review:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };

    const statusLabels = {
      open: "Open",
      in_progress: "In Progress",
      completed: "Completed",
      under_review: "Under Review",
    };

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}
      >
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  };

  // Calculate stats from actual data
  const stats = {
    ordersCreated: createdTasks.length,
    ordersCompleted: workingOnTasks.filter(
      (task) => task.owner_approved && task.executor_approved
    ).length,
    ordersInProgress: workingOnTasks.filter(
      (task) =>
        task.executor !== null &&
        !(task.owner_approved && task.executor_approved)
    ).length,
    totalEarned: workingOnTasks
      .filter((task) => task.owner_approved && task.executor_approved)
      .reduce((sum, task) => sum + task.amount, 0),
  };

  const handleApproveWork = async (taskId: string) => {
    if (!walletAddress) return;

    try {
      const response = await fetch("/api/tasks/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          user_address: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve task");
      }

      // Refresh tasks after successful approval
      const refreshResponse = await fetch(
        `/api/tasks/user?user_address=${walletAddress}`
      );
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh tasks");
      }

      const refreshedTasks = await refreshResponse.json();
      setUserTasks(refreshedTasks);

      alert("Task approved successfully!");
    } catch (err) {
      console.error("Error approving task:", err);
      alert(err instanceof Error ? err.message : "Failed to approve task");
    }
  };

  const handleSubmitWork = async (taskId: string) => {
    if (!walletAddress) return;

    try {
      const response = await fetch("/api/tasks/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          user_address: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit work");
      }

      // Refresh tasks after successful submission
      const refreshResponse = await fetch(
        `/api/tasks/user?user_address=${walletAddress}`
      );
      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh tasks");
      }

      const refreshedTasks = await refreshResponse.json();
      setUserTasks(refreshedTasks);

      alert("Work submitted successfully!");
    } catch (err) {
      console.error("Error submitting work:", err);
      alert(err instanceof Error ? err.message : "Failed to submit work");
    }
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeTaskDetails = () => {
    setIsModalOpen(false);
  };

  if (!isConnected) {
    return (
      <PageContainer>
        <ConnectWalletScreen />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar profile info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-gray-900 mb-4">
                  {userMetadata?.avatar ? (
                    <img
                      src={userMetadata.avatar}
                      alt={userMetadata.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    walletAddress ? walletAddress.charAt(2).toUpperCase() : "?"
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {userMetadata?.full_name || (walletAddress
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : "Unknown User")}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 break-all max-w-full overflow-hidden">
                  {walletAddress
                    ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`
                    : ""}
                </p>          
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Stats
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Orders Created
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.ordersCreated}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Orders Completed
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.ordersCompleted}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      In Progress
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.ordersInProgress}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Earned
                    </span>
                    <span className="font-medium text-yellow-500">
                      ${stats.totalEarned}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isLoading
                    ? "Loading..."
                    : error
                      ? "Error loading data"
                      : userTasks.length > 0
                        ? `Member since ${new Date(userTasks[0].created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                        : "New member"}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Tabs - Fix for mobile */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
              <div className="flex space-x-8 min-w-max">
                <button
                  onClick={() => setActiveTab("created")}
                  className={`py-4 px-1 text-sm font-medium border-b-2 ${
                    activeTab === "created"
                      ? "border-yellow-400 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Orders Created ({createdTasks.length})
                </button>

                <button
                  onClick={() => setActiveTab("approved")}
                  className={`py-4 px-1 text-sm font-medium border-b-2 ${
                    activeTab === "approved"
                      ? "border-yellow-400 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Working On ({workingOnTasks.length})
                </button>
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse h-40">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-auto"></div>
                  </Card>
                ))}
              </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <Card className="p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </Card>
            )}

            {/* Orders list */}
            {!isLoading && !error && (
              <div className="space-y-6">
                {activeTab === "created" && (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Orders You've Created
                      </h2>
                      <Button
                        href="/create-order"
                        variant="primary"
                        size="sm"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        }
                      >
                        Create New
                      </Button>
                    </div>

                    {createdTasks.length > 0 ? (
                      createdTasks.map((task, index) => (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                        >
                          <Card
                            className="hover:border-yellow-300 cursor-pointer"
                            onClick={() => openTaskDetails(task)}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1 min-w-0 mr-4">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words max-w-full truncate">
                                    {task.title}
                                  </h3>
                                  {getStatusBadge(task)}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-words line-clamp-3">
                                  {task.description}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-yellow-500 text-lg">
                                  ${task.amount}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {task.asset}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <div className="text-gray-500 dark:text-gray-400">
                                Created {formatTimeAgo(task.created_at)}
                                {task.executor === null && (
                                  <span className="ml-1">
                                    • Waiting for applicants
                                  </span>
                                )}
                                {task.executor !== null && (
                                  <span className="ml-1">
                                    • Assigned to {task.executor.slice(0, 6)}...
                                    {task.executor.slice(-4)}
                                  </span>
                                )}
                              </div>

                              <Button
                                variant={
                                  task.owner_approved && task.executor_approved
                                    ? "secondary"
                                    : task.executor_approved
                                      ? "primary"
                                      : "ghost"
                                }
                                size="sm"
                                onClick={() => {
                                  if (
                                    task.executor === null ||
                                    (task.owner_approved &&
                                      task.executor_approved) ||
                                    !task.executor_approved
                                  ) {
                                    openTaskDetails(task);
                                  } else if (task.executor_approved) {
                                    handleApproveWork(task._id);
                                  }
                                }}
                              >
                                {task.executor === null
                                  ? "View Details"
                                  : task.owner_approved &&
                                      task.executor_approved
                                    ? "View Result"
                                    : task.executor_approved
                                      ? "Approve Work"
                                      : "View Details"}
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-12"
                      >
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          You haven't created any orders yet
                        </p>
                        <Button href="/create-order" variant="primary">
                          Create Your First Order
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}

                {activeTab === "approved" && (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Orders You're Working On
                      </h2>
                      <Button
                        href="/orders"
                        variant="primary"
                        size="sm"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                          </svg>
                        }
                      >
                        Find More Work
                      </Button>
                    </div>

                    {workingOnTasks.length > 0 ? (
                      workingOnTasks.map((task, index) => (
                        <motion.div
                          key={task._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * index }}
                        >
                          <Card
                            className="hover:border-yellow-300 cursor-pointer"
                            onClick={() => openTaskDetails(task)}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1 min-w-0 mr-4">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words max-w-full truncate">
                                    {task.title}
                                  </h3>
                                  {getStatusBadge(task)}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-words line-clamp-3">
                                  {task.description}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold text-yellow-500 text-lg">
                                  ${task.amount}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {task.asset}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <div className="text-gray-500 dark:text-gray-400">
                                Client: {task.owner.slice(0, 6)}...
                                {task.owner.slice(-4)}
                                <span className="ml-2">
                                  •{" "}
                                  {task.owner_approved && task.executor_approved
                                    ? `Completed ${formatTimeAgo(task.taken_at || task.created_at)}`
                                    : `Started ${formatTimeAgo(task.taken_at || task.created_at)}`}
                                </span>
                              </div>

                              <Button
                                size="sm"
                                variant={
                                  (task.owner_approved &&
                                    task.executor_approved) ||
                                  task.executor_approved
                                    ? "ghost"
                                    : "primary"
                                }
                                onClick={() => {
                                  if (
                                    (task.owner_approved &&
                                      task.executor_approved) ||
                                    task.executor_approved
                                  ) {
                                    openTaskDetails(task);
                                  } else {
                                    handleSubmitWork(task._id);
                                  }
                                }}
                              >
                                {(task.owner_approved &&
                                  task.executor_approved) ||
                                task.executor_approved
                                  ? "View Details"
                                  : "Submit Work"}
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center py-12"
                      >
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          You're not working on any orders yet
                        </p>
                        <Button href="/orders" variant="primary">
                          Browse Available Orders
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeTaskDetails}
      />
    </PageContainer>
  );
}