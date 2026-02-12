# BGMI Player Auction System

A complete real-time esports auction platform where teams bid on players in an IPL-style auction.

## 🚀 Quick Start (Windows)

1.  **Database Setup**:
    *   Make sure you have **MySQL** installed and running.
    *   Create a database named `bgmi_auction_db` (or the system will try to create it, but better to be safe).
    *   Import `backend/schema.sql` if needed (the app does not auto-migrate, you might need to run the SQL manually in your MySQL Workbench or CLI).
    *   Check `backend/.env` and update `DB_PASSWORD` if your MySQL root user has a password.

2.  **Install & Run**:
    *   Open a terminal in the root folder (`d:\bgmi_auction`).
    *   Run the following commands:

    ```powershell
    # 1. Install Backend Dependencies
    cd backend
    npm install
    
    # 2. Seed Database (Optional - Creates Dummy Data)
    # Ensure .env is correct before running this!
    node seed.js

    # 3. Start Backend Server
    node server.js
    ```

    *   Open a **new** terminal for Frontend:
    ```powershell
    cd frontend
    npm install
    npm run dev
    ```

3.  **Access the App**:
    *   Open your browser at the URL shown in the frontend terminal (usually `http://localhost:5173` or `5174`).

## 🔑 Default Credentials (from Seed)

**Admin**:
*   Username: `admin`
*   Password: `admin123`

**Team Owners**:
*   Usernames: `soul_owner`, `godl_owner`, `tx_owner`, `ge_owner`, `blind_owner`
*   Password: `team123`

**Players**:
*   Usernames: `jonathan`, `mortal`, `scout`, etc.
*   Password: `player123`

## 🛠 Tech Stack
*   **Frontend**: React, Tailwind CSS, Socket.io Client
*   **Backend**: Node.js, Express, MySQL, Socket.io Server
*   **Real-time**: Socket.io for live bidding updates.

## 📱 Features
*   **Live Auction**: Real-time bidding with timer and broadcast updates.
*   **Role-based Dashboards**: Admin controls, Team bidding, Player profile view.
*   **Video Support**: Gameplay video embedding from YouTube.