"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import Link from 'next/link';

// Mock featured orders
const featuredOrders = [
  {
    id: 1,
    title: "Create a DeFi Dashboard UI",
    description: "Looking for a skilled designer to create a modern, intuitive DeFi dashboard UI with real-time data visualization and dark mode support.",
    reward: 750,
    category: "Design",
    deadline: "7 days",
    client: "eth_whale.eth"
  },
  {
    id: 2,
    title: "NFT Marketplace Smart Contract Audit",
    description: "Need a comprehensive security audit for my NFT marketplace smart contracts. Experience with ERC-721, ERC-1155, and marketplaces required.",
    reward: 2100,
    category: "Development",
    deadline: "10 days",
    client: "defi_dev.eth"
  },
  {
    id: 3,
    title: "Farcaster Bot Development",
    description: "Develop a Farcaster bot that shares daily crypto insights and market analysis with interactive frames for users to engage with.",
    reward: 1200,
    category: "Development",
    deadline: "14 days",
    client: "farcaster_fan.eth"
  },
  {
    id: 4,
    title: "Web3 Educational Content Writing",
    description: "Create a series of educational articles explaining complex web3 concepts in simple terms for beginners. Topics include wallets, DeFi, and NFTs.",
    reward: 650,
    category: "Content",
    deadline: "21 days",
    client: "crypto_teacher.eth"
  },
];

export const FeaturedOrders = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="py-16 lg:py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Orders
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Browse our top opportunities from leading Web3 projects and builders
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Link href={`/orders/${order.id}`}>
                <Card className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                      {order.category}
                    </span>
                    <span className="font-bold text-yellow-500">
                      ${order.reward}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {order.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                    {order.description}
                  </p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs mr-2">
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
                </Card>
              </Link>
            </motion.div>
          ))}
          
          <motion.div
            className="md:col-span-2 lg:col-span-3 flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <Button href="/orders" variant="secondary">
              View All Orders
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
