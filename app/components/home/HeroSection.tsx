"use client";

import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useInView } from 'react-intersection-observer';

export const HeroSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="relative overflow-hidden" ref={ref}>
      {/* Bg elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 left-10 w-64 h-64 rounded-full bg-yellow-300 opacity-20 blur-3xl"
          animate={{ 
            x: [0, 30, 0], 
            y: [0, 50, 0],
            scale: [1, 1.2, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 20,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-72 h-72 rounded-full bg-blue-400 opacity-10 blur-3xl"
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 30, 0],
            scale: [1, 1.3, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 25,
            ease: "easeInOut" 
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 flex flex-col items-center text-center">
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          The Talent Marketplace for 
          <span className="block bg-gradient-to-r from-yellow-400 to-yellow-500 text-transparent bg-clip-text mt-1">
            Web3 Builders
          </span>
        </motion.h1>

        <motion.p 
          className="text-lg sm:text-xl max-w-3xl text-gray-600 dark:text-gray-400 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Connect with the best freelancers in the Web3 space. Create, collaborate,
          and pay securely with USDC on Layer 3. Powered by Farcaster.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Button 
            href="/orders" 
            variant="primary" 
            size="lg"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            }
          >
            Browse Orders
          </Button>
          <Button 
            href="/create-order" 
            variant="outline" 
            size="lg"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            }
          >
            Post a Job
          </Button>
        </motion.div>

        <motion.div 
          className="mt-16 grid grid-cols-3 gap-8 sm:gap-16 max-w-3xl mx-auto w-full"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {[
            { value: "37K+", label: "Freelancers" },
            { value: "5.2M", label: "USDC Paid" },
            { value: "4500+", label: "Completed Jobs" },
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              className="flex flex-col items-center"
              initial={{ y: 30 }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.7 + index * 0.1 }}
            >
              <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-transparent bg-clip-text">
                {stat.value}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
