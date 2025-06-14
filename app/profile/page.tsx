"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConnectWalletScreen } from '../components/ui/ConnectWalletScreen';
import { useWallet } from '../context/WalletContext';
import Link from 'next/link';

// Mock data for profile page
const mockUserData = {
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  username: "web3_builder.eth",
  avatar: "/placeholder.jpg",
  joinedDate: "May 2023",
  stats: {
    ordersCreated: 12,
    ordersCompleted: 8,
    ordersInProgress: 3,
    totalEarned: 4850,
  }
};

// Mock orders data
const createdOrders = [
  {
    id: 101,
    title: "Design Tokenomics Dashboard",
    description: "Looking for a designer to create a dashboard for tracking token metrics and analytics.",
    reward: 750,
    status: "open",
    createdAt: "2 days ago",
    applicants: 3
  },
  {
    id: 102,
    title: "Write Documentation for NFT Platform",
    description: "Need comprehensive documentation for a new NFT minting and trading platform.",
    reward: 500,
    status: "in_progress",
    createdAt: "1 week ago",
    freelancer: "crypto_writer.eth"
  },
  {
    id: 103,
    title: "Create 3D Models for Metaverse",
    description: "Design 5 unique 3D avatar accessories for a metaverse project.",
    reward: 1200,
    status: "completed",
    createdAt: "3 weeks ago",
    freelancer: "3d_master.eth"
  }
];

const approvedOrders = [
  {
    id: 201,
    title: "Smart Contract for Token Vesting",
    description: "Develop a token vesting contract with time-based unlocking and emergency pause functionality.",
    reward: 1800,
    status: "in_progress",
    client: "token_project.eth",
    startedAt: "5 days ago"
  },
  {
    id: 202,
    title: "Create Marketing Graphics for DeFi Launch",
    description: "Design a set of 10 social media graphics for our DeFi protocol launch.",
    reward: 650,
    status: "completed",
    client: "defi_dao.eth",
    completedAt: "2 weeks ago"
  }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("created");
  const { isConnected } = useWallet();

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    };
    
    const statusLabels = {
      open: "Open",
      in_progress: "In Progress",
      completed: "Completed"
    };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
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
                  {mockUserData.username.charAt(0).toUpperCase()}
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {mockUserData.username}
                </h2>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 break-all">
                  {mockUserData.address.slice(0, 6)}...{mockUserData.address.slice(-4)}
                </p>
                
                <Button variant="primary" size="sm" fullWidth>
                  Edit Profile
                </Button>
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
                      {mockUserData.stats.ordersCreated}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Orders Completed
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {mockUserData.stats.ordersCompleted}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      In Progress
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {mockUserData.stats.ordersInProgress}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Earned
                    </span>
                    <span className="font-medium text-yellow-500">
                      ${mockUserData.stats.totalEarned}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Member since {mockUserData.joinedDate}
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
            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("created")}
                  className={`py-4 px-1 text-sm font-medium border-b-2 ${
                    activeTab === "created"
                      ? "border-yellow-400 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Orders Created ({createdOrders.length})
                </button>
                
                <button
                  onClick={() => setActiveTab("approved")}
                  className={`py-4 px-1 text-sm font-medium border-b-2 ${
                    activeTab === "approved"
                      ? "border-yellow-400 text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Working On ({approvedOrders.length})
                </button>
              </div>
            </div>
            
            {/* Orders list */}
            <div className="space-y-6">
              {activeTab === "created" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Orders You've Created
                    </h2>
                    <Button
                      href="/create-order"
                      variant="primary"
                      size="sm"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      }
                    >
                      Create New
                    </Button>
                  </div>
                  
                  {createdOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <Card className="hover:border-yellow-300">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {order.title}
                              </h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {order.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-500 text-lg">
                              ${order.reward}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              USDC
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-500 dark:text-gray-400">
                            Created {order.createdAt}
                            {order.status === 'open' && (
                              <span className="ml-2">
                                • {order.applicants} applicants
                              </span>
                            )}
                            {(order.status === 'in_progress' || order.status === 'completed') && order.freelancer && (
                              <span className="ml-2">
                                • Assigned to {order.freelancer}
                              </span>
                            )}
                          </div>
                          
                          <Button
                            variant={order.status === 'completed' ? 'ghost' : 'outline'}
                            size="sm"
                          >
                            {order.status === 'open' ? 'View Applicants' : 
                             order.status === 'in_progress' ? 'View Progress' : 
                             'View Result'}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {createdOrders.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-12"
                    >
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You haven't created any orders yet
                      </p>
                      <Button
                        href="/create-order"
                        variant="primary"
                      >
                        Create Your First Order
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
              
              {activeTab === "approved" && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Orders You're Working On
                    </h2>
                    <Button
                      href="/orders"
                      variant="primary"
                      size="sm"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                        </svg>
                      }
                    >
                      Find More Work
                    </Button>
                  </div>
                  
                  {approvedOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <Card className="hover:border-yellow-300">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {order.title}
                              </h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {order.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-500 text-lg">
                              ${order.reward}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              USDC
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-gray-500 dark:text-gray-400">
                            Client: {order.client}
                            <span className="ml-2">
                              • {order.status === 'completed' ? `Completed ${order.completedAt}` : `Started ${order.startedAt}`}
                            </span>
                          </div>
                          
                          <Button
                            variant={order.status === 'completed' ? 'outline' : 'primary'}
                            size="sm"
                          >
                            {order.status === 'in_progress' ? 'Submit Work' : 'View Details'}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                  
                  {approvedOrders.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-12"
                    >
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        You're not working on any orders yet
                      </p>
                      <Button
                        href="/orders"
                        variant="primary"
                      >
                        Browse Available Orders
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
