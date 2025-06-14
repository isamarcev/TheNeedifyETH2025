"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./components/ui/Button";
import { useEffect, useState } from "react";

const funnyMessages = [
  "404: Page not found. Maybe it's building on Layer 4?",
  "Oops! This page went to the moon without us.",
  "We looked everywhere, even in our cold wallets.",
  "This page is more elusive than a rare NFT.",
  "This link has less liquidity than a dead meme coin.",
  "Looks like this task wasn't approved by anyone.",
  "We'll offer 500 USDC for whoever finds this page. (joke)",
  "Not even our smart contracts could verify this page.",
];

export default function NotFound() {
  const [message, setMessage] = useState("");
  const [isFloating, setIsFloating] = useState(false);
  const [rotation, setRotation] = useState(0);

  const getNewJoke = () => {
    let newMessage;
    do {
      newMessage =
        funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
    } while (newMessage === message);

    setMessage(newMessage);
  };

  useEffect(() => {
    getNewJoke();
    const timer = setTimeout(() => setIsFloating(true), 500);
    setRotation(Math.random() * 10 - 5);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-purple-400/50"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -50, Math.random() * 50],
              x: [null, Math.random() * -50, Math.random() * 50],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: Math.random() * 5 + 5,
            }}
          />
        ))}
      </div>

      <div className="text-center max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="mb-8 relative"
        >
          <motion.div
            className="relative inline-block"
            animate={
              isFloating
                ? {
                    y: [0, -15, 0],
                    rotate: [rotation, rotation + 3, rotation],
                  }
                : {}
            }
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 4,
              ease: "easeInOut",
            }}
          >
            <div className="text-[10rem] font-bold text-purple-400 opacity-90 leading-none">
              4<span className="inline-block">0</span>4
            </div>

            <motion.div
              className="absolute -top-10 -right-8 transform rotate-12"
              animate={{ rotate: [12, -5, 12] }}
              transition={{ repeat: Infinity, duration: 5 }}
            >
              <span className="text-3xl">💸</span>
            </motion.div>

            <motion.div
              className="absolute bottom-0 -left-8 transform -rotate-12"
              animate={{ rotate: [-12, 5, -12] }}
              transition={{ repeat: Infinity, duration: 6, delay: 1 }}
            >
              <span className="text-3xl">🔍</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 mb-8 text-lg"
        >
          {message}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="primary"
            href="/"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            }
          >
            Back to Home
          </Button>

          <Button
            variant="ghost"
            onClick={getNewJoke}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            New Joke
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-sm text-gray-500 dark:text-gray-500"
        >
          Maybe this is a sign you should be earning crypto instead of browsing
        </motion.p>
      </div>
    </div>
  );
}
