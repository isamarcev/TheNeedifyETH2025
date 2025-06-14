"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConnectWalletScreen } from '../components/ui/ConnectWalletScreen';
import { useWallet } from '../context/WalletContext';

// Type definition for tasks
interface Task {
  _id: string;
  owner: string;
  title: string;
  description: string;
  asset: string;
  amount: number;
  category: string;
  deadline: string | null;
  executor: string | null;
  taken_at: string | null;
  owner_approved: boolean;
  executor_approved: boolean;
  created_at: string;
}

const categories = [
  { id: "all", name: "All Categories" },
  { id: "design", name: "Design" },
  { id: "development", name: "Development" },
  { id: "content", name: "Content" },
  { id: "marketing", name: "Marketing" }
];

export default function OrdersPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const { isConnected, walletAddress } = useWallet();

  // Fetch tasks from API
  useEffect(() => {
    async function fetchTasks() {
      if (!walletAddress) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/tasks/market?user_address=${walletAddress}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isConnected && walletAddress) {
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, walletAddress]);

  // Filter tasks
  useEffect(() => {
    let result = tasks;
    
    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(task => 
        task.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredTasks(result);
  }, [selectedCategory, searchQuery, tasks]);

  const handleTakeOrder = async (taskId: string) => {
    if (!isConnected) {
      setShowWalletConnect(true);
      return;
    }
    
    try {
      const response = await fetch('/api/tasks/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          user_address: walletAddress,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply for task');
      }
      
      // Refresh tasks after successful application
      const refreshResponse = await fetch(`/api/tasks/market?user_address=${walletAddress}`);
      const refreshedTasks = await refreshResponse.json();
      setTasks(refreshedTasks);
      
      alert('Application submitted successfully!');
    } catch (err) {
      console.error('Error applying for task:', err);
      alert(err instanceof Error ? err.message : 'Failed to apply for task');
    }
  };

  const closeWalletConnect = () => {
    setShowWalletConnect(false);
  };

  // Format deadline to a readable string
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline";
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} days` : "Expired";
  };

  if (showWalletConnect) {
    return (
      <PageContainer>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-10"
          >
            <button
              onClick={closeWalletConnect}
              className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
          <ConnectWalletScreen />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Find Web3 Orders
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Browse available orders from projects seeking your skills and expertise
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Categories filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              href="/create-order" 
              variant="primary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              }
            >
              Create Order
            </Button>
          </motion.div>
        </div>

        {/* Results count or loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 text-gray-600 dark:text-gray-400"
        >
          {isLoading ? (
            "Loading tasks..."
          ) : (
            `Showing ${filteredTasks.length} orders`
          )}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tasks grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                      {task.category}
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-yellow-500 text-lg">
                        ${task.amount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {task.asset}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 break-words max-w-full truncate">
                    {task.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                    {task.description}
                  </p>
                  
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs mr-2">
                          {task.owner.substring(0, 2)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                          {task.owner.slice(0, 6)}...{task.owner.slice(-4)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDeadline(task.deadline)}
                      </span>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleTakeOrder(task._id)}
                    >
                      Take Order
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredTasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No orders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
