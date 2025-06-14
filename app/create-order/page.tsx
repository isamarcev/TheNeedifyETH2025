"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConnectWalletScreen } from '../components/ui/ConnectWalletScreen';
import { useWallet } from '../context/WalletContext';
import { useRouter } from 'next/navigation';
import {
  Transaction,
  TransactionButton,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
  TransactionResponse,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionStatus,
} from "@coinbase/onchainkit/transaction";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";

// USDC contract address on Polygon
const USDC_CONTRACT_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

export default function CreateOrderPage() {
  const { isConnected, walletAddress } = useWallet();
  const { address } = useAccount();
  const router = useRouter();
  const sendNotification = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: ''
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    reward?: string;
    transaction?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error when user types
    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: {
      title?: string;
      description?: string;
      reward?: string;
    } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    if (!formData.reward.trim()) {
      newErrors.reward = 'Reward is required';
    } else if (isNaN(Number(formData.reward)) || Number(formData.reward) <= 0) {
      newErrors.reward = 'Reward must be a positive number';
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
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: walletAddress,
          title: formData.title,
          description: formData.description,
          asset: 'USDC',
          amount: Number(formData.reward),
          category: 'Development', // You might want to add a category field to the form
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      router.push('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      setIsSubmitting(false);
    }
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

        <Card padding="lg" className="mb-8">
          <form onSubmit={handleSubmit}>
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
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
                icon={
                  <span className="text-gray-500">$</span>
                }
                description="Set a fair price for the work required. Payment will be held in escrow until completion."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex justify-end"
            >
              {address ? (
                <Transaction
                  calls={[
                    {
                      to: USDC_CONTRACT_ADDRESS,
                      data: "0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", // This will be replaced with actual transfer data
                      value: BigInt(0),
                    },
                  ]}
                  onSuccess={handleSuccess}
                  onError={handleError}
                >
                  <TransactionButton />
                  <TransactionStatus>
                    <TransactionStatusAction />
                    <TransactionStatusLabel />
                  </TransactionStatus>
                  <TransactionToast className="mb-4">
                    <TransactionToastIcon />
                    <TransactionToastLabel />
                    <TransactionToastAction />
                  </TransactionToast>
                </Transaction>
              ) : (
                <p className="text-yellow-400 text-sm text-center mt-2">
                  Connect your wallet to create an order
                </p>
              )}
            </motion.div>
            {errors.transaction && (
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
            )}
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
                description: "Clearly define project scope, deliverables, and technical requirements"
              },
              {
                title: "Set a fair budget",
                description: "Research market rates for similar projects to set a competitive reward"
              },
              {
                title: "Establish timeline",
                description: "Provide realistic deadlines and milestones for the project"
              },
              {
                title: "Include examples",
                description: "Link to similar projects or styles you like as reference"
              }
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
