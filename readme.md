# 🎮 BGMI Player Auction System

A complete, real-time esports auction platform designed to simulate an IPL-style bidding war for Battlegrounds Mobile India (BGMI) players. 

This system provides a highly interactive, cinematic, and seamless auction experience where esports organizations (Team Owners) can bid on professional players in real-time, managed by a central administration dashboard.

---

## 🌟 Overview

The BGMI Player Auction System brings the thrill of professional esports drafting to the web. It is built to handle live, high-stakes bidding sessions where multiple team owners compete to acquire top-tier talent for their rosters. 

The platform features distinct dashboards for different user roles—Admins, Team Owners, and Players—ensuring a structured and exciting auction flow from player registrations to the final hammer drop.

---

## 🔥 Key Features

### 📡 Real-Time Live Auction
*   **Live Bidding Arena:** A synchronized, real-time bidding interface where team owners can place bids instantly.
*   **Dynamic Timers & Counters:** Automated countdown timers that reset upon new bids, ensuring fair play.
*   **Cinematic "Sold" State:** A dramatic, premium full-screen animation overlay that triggers when a player is successfully bought, displaying the final price and the acquiring team's logo.
*   **Live Activity Feed:** A real-time log of all bids, system messages, and auction events keeping all participants informed.

### 👥 Multi-Role Architecture

**1. Admin Dashboard (The Auctioneer)**
*   Complete control over the auction flow (Start, Pause, Resume, or End sessions).
*   Ability to bring players under the hammer sequentially.
*   Player verification system: Admins can review player profiles, stats, and gameplay video proofs before approving them for the auction.
*   Comprehensive oversight of all teams, their remaining budgets, and roster sizes.

**2. Team Owner Dashboard (The Bidders)**
*   Live budget tracking and roster management.
*   One-click bidding interface with real-time feedback.
*   Access to detailed player profiles, including stats (Tier, K/D Ratio, Role) and embedded gameplay videos to make informed decisions.
*   A dedicated "My Team" page to view successfully acquired players.

**3. Player Dashboard (The Talent)**
*   Personalized profile management where players can update their details, roles, and competitive experience.
*   Ability to submit YouTube gameplay links as proof of skill for Admin verification.
*   Live status tracking to see if they are pending verification, in the auction pool, or already sold to a team.

---

## 🛠 Tech Stack

The application is built using a modern, scalable, and fully responsive JavaScript stack:

*   **Frontend:** React.js, Tailwind CSS (for premium, esports-style UI/UX), Framer Motion (for cinematic animations)
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB & MySQL (Hybrid data management)
*   **Real-Time Communication:** Socket.io (Low-latency bidirectional event handling)
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt for secure, role-based access control.

---

## 🎨 Design Philosophy

The user interface is heavily inspired by modern esports broadcasts. It prioritizes a dark-mode aesthetic with vibrant accent colors, glassmorphism elements, and smooth micro-interactions. The goal is to provide an immersive experience that feels less like a traditional software tool and more like a live esports event broadcast.