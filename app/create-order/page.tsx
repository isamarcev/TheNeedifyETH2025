"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "../components/layout/PageContainer";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConnectWalletScreen } from "../components/ui/ConnectWalletScreen";
import { useWallet } from "../context/WalletContext";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { TransactionError, TransactionResponse } from "@coinbase/onchainkit/transaction";

export default function CreateOrderPage() {
  const { isConnected, walletAddress } = useWallet();
  const { address } = useAccount();
  const router = useRouter();
  const sendNotification = useNotification();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    category: "Development", // Default
    deadline: "",
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    reward?: string;
    category?: string;
    deadline?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdTaskTitle, setCreatedTaskTitle] = useState("");

  // Category options
  const categories = [
    { id: "design", name: "Design" },
    { id: "development", name: "Development" },
    { id: "content", name: "Content" },
    { id: "marketing", name: "Marketing" },
    { id: "other", name: "Other" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear error when user types
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: {
      title?: string;
      description?: string;
      reward?: string;
      category?: string;
      deadline?: string;
    } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (!formData.reward.trim()) {
      newErrors.reward = "Reward is required";
    } else if (isNaN(Number(formData.reward)) || Number(formData.reward) <= 0) {
      newErrors.reward = "Reward must be a positive number";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      newErrors.deadline = "Deadline must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuccess = async (response: TransactionResponse) => {
    const transactionHash = response.transactionReceipts[0].transactionHash;
    console.log('Transaction successful:', transactionHash);

    await sendNotification({
      title: "Order Created!",
      body: `Your order has been created successfully. Transaction: ${transactionHash}`,
    });

    // Create the order in your database
    // await createOrder({
    //   title: formData.title,
    //   description: formData.description,
    //   reward: formData.reward,
    //   transactionHash: transactionHash
    // });

    router.push('/orders');
  };

  const handleError = (error: TransactionError) => {
    console.error('Transaction failed:', error);
    setErrors(prev => ({
      ...prev,
      transaction: error.message || 'Failed to create order'
    }));
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Calculate deadline Date if provided, otherwise use default (14 days)
      const deadlineDate = formData.deadline
        ? new Date(formData.deadline)
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: walletAddress,
          title: formData.title,
          description: formData.description,
          asset: "USDC",
          amount: Number(formData.reward),
          category: formData.category,
          deadline: deadlineDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      setCreatedTaskTitle(formData.title);

      setFormData({
        title: "",
        description: "",
        reward: "",
        category: "Development",
        deadline: "",
      });

      setShowSuccessPopup(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error creating order:", error);
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessPopup(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToProfile = () => {
    setShowSuccessPopup(false);
    router.push("/profile");
  };

  useEffect(() => {
    if (showSuccessPopup) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "var(--scrollbar-width, 0px)"; // Prevent layout shift
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [showSuccessPopup]);

  if (!isConnected) {
    return (
      <PageContainer>
        <ConnectWalletScreen />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Create a New Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Describe your project in detail to attract the right talent
          </p>
        </motion.div>

        {/* Success Popup */}
        <AnimatePresence>
          {showSuccessPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-xl"
              >
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-green-500 dark:text-green-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Order Created Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Your order{" "}
                    <span className="font-medium truncate inline-block max-w-[200px] align-bottom overflow-hidden">
                      {createdTaskTitle}
                    </span>{" "}
                    has been created.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    It's now available for freelancers to see and apply.
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleGoToProfile}
                  >
                    Go to Profile
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleCreateAnother}
                  >
                    Create Another Order
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card padding="lg" className="mb-8">
          <form onSubmit={handleSubmit}>
            {/* Title field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Input
                id="title"
                label="Order Title"
                placeholder="e.g. Create a DeFi Dashboard UI"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                required
                maxLength={100}
                description="A clear, specific title will attract qualified freelancers"
              />
            </motion.div>

            {/* Description field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Input
                id="description"
                label="Description"
                placeholder="Describe your project in detail. Include requirements, deliverables, and timeline..."
                value={formData.description}
                onChange={handleChange}
                error={errors.description}
                required
                multiline
                rows={6}
                maxLength={1000}
                description="Be specific about what you need and include all relevant details"
              />
            </motion.div>

            {/* Category dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-4"
            >
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Category <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose the category that best describes your project
              </p>
            </motion.div>

            {/* Deadline field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Input
                id="deadline"
                label="Deadline (Optional)"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                error={errors.deadline}
                description="When do you need this completed? Defaults to 14 days if not specified."
              />
            </motion.div>

            {/* Reward field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Input
                id="reward"
                label="Reward (USDC)"
                type="number"
                placeholder="100"
                value={formData.reward}
                onChange={handleChange}
                error={errors.reward}
                required
                icon={<span className="text-gray-500">$</span>}
                description="Set a fair price for the work required. Payment will be held in escrow until completion."
              />
            </motion.div>

            {/* Submit button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex justify-end"
            >
              <Button
                variant="primary"
                type="submit"
                loading={isSubmitting}
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                }
              >
                Create Order
              </Button>
            </motion.div>
            {/* {errors.transaction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {errors.transaction}
                </p>
              </motion.div>
            )} */}
          </form>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tips for creating an effective order
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Be specific",
                description:
                  "Clearly define project scope, deliverables, and technical requirements",
              },
              {
                title: "Set a fair budget",
                description:
                  "Research market rates for similar projects to set a competitive reward",
              },
              {
                title: "Establish timeline",
                description:
                  "Provide realistic deadlines and milestones for the project",
              },
              {
                title: "Include examples",
                description:
                  "Link to similar projects or styles you like as reference",
              },
            ].map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {tip.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tip.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
