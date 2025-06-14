"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConnectWalletScreen } from '../components/ui/ConnectWalletScreen';
import { useWallet } from '../context/WalletContext';

const allOrders = [
  {
    id: 1,
    title: "Create a DeFi Dashboard UI",
    description: "Looking for a skilled designer to create a modern, intuitive DeFi dashboard UI with real-time data visualization and dark mode support.",
    reward: 750,
    category: "Design",
    deadline: "7 days",
    client: "eth_whale.eth",
    status: "open"
  },
  {
    id: 2,
    title: "NFT Marketplace Smart Contract Audit",
    description: "Need a comprehensive security audit for my NFT marketplace smart contracts. Experience with ERC-721, ERC-1155, and marketplaces required.",
    reward: 2100,
    category: "Development",
    deadline: "10 days",
    client: "defi_dev.eth",
    status: "open"
  },
  {
    id: 3,
    title: "Farcaster Bot Development",
    description: "Develop a Farcaster bot that shares daily crypto insights and market analysis with interactive frames for users to engage with.",
    reward: 1200,
    category: "Development",
    deadline: "14 days",
    client: "farcaster_fan.eth",
    status: "open"
  },
  {
    id: 4,
    title: "Web3 Educational Content Writing",
    description: "Create a series of educational articles explaining complex web3 concepts in simple terms for beginners. Topics include wallets, DeFi, and NFTs.",
    reward: 650,
    category: "Content",
    deadline: "21 days",
    client: "crypto_teacher.eth",
    status: "open"
  },
  {
    id: 5,
    title: "3D NFT Collection Design",
    description: "Create a collection of 20 unique 3D NFT characters with different traits and variations. Characters should have a cyberpunk theme.",
    reward: 3500,
    category: "Design",
    deadline: "30 days",
    client: "nft_collector.eth",
    status: "open"
  },
  {
    id: 6,
    title: "Smart Contract Gas Optimization",
    description: "Optimize gas usage in an existing DeFi protocol smart contract. Looking for significant reduction in transaction costs.",
    reward: 1800,
    category: "Development",
    deadline: "14 days",
    client: "gas_saver.eth",
    status: "open"
  },
  {
    id: 7,
    title: "Layer 3 Protocol Documentation",
    description: "Create comprehensive technical documentation for a new Layer 3 protocol, including architecture, API references, and tutorials.",
    reward: 950,
    category: "Content",
    deadline: "21 days",
    client: "layer3_builder.eth",
    status: "open"
  },
  {
    id: 8,
    title: "Web3 Social Mobile App Design",
    description: "Design a mobile app for a decentralized social platform. Need complete UI/UX design with a focus on user engagement.",
    reward: 1350,
    category: "Design",
    deadline: "14 days",
    client: "social_dao.eth",
    status: "open"
  }
];

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
  const [filteredOrders, setFilteredOrders] = useState(allOrders);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const { isConnected, WalletButton } = useWallet();

  // Filter orders
  useEffect(() => {
    let result = allOrders;
    
    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(order => 
        order.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by search query не юзаєм
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.title.toLowerCase().includes(query) || 
        order.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredOrders(result);
  }, [selectedCategory, searchQuery]);

  const handleTakeOrder = () => {
    if (!isConnected) {
      setShowWalletConnect(true);
    } else {
      // Logic for connected user taking an order
      // Add real implementation here
      alert("Order taken successfully!");
    }
  };

  const closeWalletConnect = () => {
    setShowWalletConnect(false);
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
          {/* Search bar */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:max-w-md"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </motion.div> */}
          
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

          {/* Create order button */}
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

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 text-gray-600 dark:text-gray-400"
        >
          Showing {filteredOrders.length} orders
        </motion.div>

        {/* Orders grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                    {order.category}
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-yellow-500 text-lg">
                      ${order.reward}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      USDC
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {order.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">
                  {order.description}
                </p>
                
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs mr-2">
                        {order.client.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
                        {order.client}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {order.deadline}
                    </span>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={handleTakeOrder}
                  >
                    Take Order
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
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
