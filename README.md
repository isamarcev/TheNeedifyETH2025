## 🚀 Needify — Decentralized Freelance Task Matching

Needify is a peer-to-peer freelance task board integrated with Farcaster and powered by the Yellow ERC-7824 escrow protocol. It allows wallet-based users to create, accept, and complete bounties in a trustless and social environment.

🛠 Tech Stack
Layer	Tools
Frontend	Next.js, Tailwind CSS
Database	MongoDB
Protocol	Yellow ERC-7824
Auth	Wallet-based (MetaMask)
Messaging	channel_id (mocked)

## 💡 Key Features
Fully decentralized — no centralized backend

Auth via wallet address

Post and accept freelance bounties

Escrow logic using ERC-7824

Social profile enrichment using Farcaster

## 🎯 Problem
Web3 lacks a smooth, trustless way to collaborate on microtasks between builders, without relying on centralized intermediaries or reputation-less addresses.

## ✅ Solution
Needify offers:

Trustless onboarding via wallet and social profile (Farcaster)

Peer-to-peer collaboration without centralized escrow agents

Escrow logic via Yellow ERC-7824 standard

Simple onboarding with no registration — just connect your wallet

## 👤 Target Users
Builders/founders looking to delegate microtasks securely

Freelancers or contributors who want reputation-backed opportunities

DAOs or open communities coordinating on small jobs

## 🔍 How It Works
User connects via MetaMask

Posts a task: title, description, amount, asset

Another user accepts it (start_task(channel_id))

Both parties confirm → funds are released via final_task(channel_id)

Task and channel info stored in MongoDB

## 🧱 Next Steps
Add real Farcaster and ERC-7824 integrations

Add reputation system

UI improvements and live deployment