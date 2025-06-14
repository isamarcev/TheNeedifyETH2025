"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Task } from "@/app/types";

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal = ({
  task,
  isOpen,
  onClose,
}: TaskDetailsModalProps) => {
  const [copiedAddresses, setCopiedAddresses] = useState<
    Record<string, boolean>
  >({});

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "var(--scrollbar-width, 0px)";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (task: Task) => {
    if (task.executor === null) return "Open";
    if (task.owner_approved && task.executor_approved) return "Completed";
    if (task.executor_approved) return "Under Review";
    return "In Progress";
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedAddresses((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setCopiedAddresses((prev) => ({ ...prev, [id]: false }));
        }, 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2">
              <div className="flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white break-words">
                    {task.title}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${
                      task.executor === null
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : task.owner_approved && task.executor_approved
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          : task.executor_approved
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    {getStatusLabel(task)}
                  </span>
                </div>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                  {task.category}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded-full flex-shrink-0"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 my-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="font-medium text-gray-900 dark:text-white">
                  Reward
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-yellow-500 text-xl mr-1">
                    ${task.amount}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {task.asset}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </div>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
                  {task.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Created By
                  </div>
                  <div
                    className="text-gray-600 dark:text-gray-400 flex items-center gap-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                    onClick={() => copyToClipboard(task.owner, "owner")}
                    title="Click to copy address"
                  >
                    <span className="break-all">{task.owner}</span>
                    {copiedAddresses["owner"] ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 lg:h-8 lg:w-8 text-amber-600 dark:text-amber-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 lg:h-8 lg:w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Created On
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {formatDate(task.created_at)}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Deadline
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {formatDate(task.deadline)}
                  </div>
                </div>

                {task.executor && (
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      Assigned To
                    </div>
                    <div
                      className="text-gray-600 dark:text-gray-400 flex items-center gap-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                      onClick={() =>
                        copyToClipboard(task.executor!, "executor")
                      }
                      title="Click to copy address"
                    >
                      <span className="break-all">{task.executor}</span>
                      {copiedAddresses["executor"] ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 lg:h-8 lg:w-8 text-amber-600 dark:text-amber-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 lg:h-8 lg:w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {task.taken_at && (
                <div className="mb-4">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Work Started
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {formatDate(task.taken_at)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
