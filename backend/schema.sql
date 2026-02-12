-- Database Schema for BGMI Player Auction System

CREATE DATABASE IF NOT EXISTS bgmi_auction_db;

USE bgmi_auction_db;

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Owners Table
CREATE TABLE IF NOT EXISTS team_owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    team_logo VARCHAR(255),
    budget DECIMAL(10, 2) DEFAULT 10000000.00, -- Default budget example: 1 Crore
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players Table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('IGL', 'Assaulter', 'Support', 'Sniper') NOT NULL,
    tier VARCHAR(50) NOT NULL,
    kd_ratio DECIMAL(4, 2) NOT NULL,
    experience_years INT NOT NULL,
    tournament_history TEXT,
    video_link VARCHAR(255),
    is_sold BOOLEAN DEFAULT FALSE,
    sold_price DECIMAL(10, 2) DEFAULT 0,
    team_id INT,
    base_price DECIMAL(10, 2) DEFAULT 50000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES team_owners(id) ON DELETE SET NULL
);

-- Auction Sessions Table (Manage live auction state)
CREATE TABLE IF NOT EXISTS auction_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    current_bid DECIMAL(10, 2) DEFAULT 0.00,
    highest_bidder_id INT,
    status ENUM('PENDING', 'ONGOING', 'COMPLETED', 'UNSOLD') DEFAULT 'PENDING',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (highest_bidder_id) REFERENCES team_owners(id)
);

-- Transaction History Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES team_owners(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Default Admin
INSERT INTO admins (username, password) VALUES ('admin', '$2a$10$X7.X.X7.X.X7.X.X7.X.X7.X.X7.X.X7.X.X7.X.X7.X.X7'); -- Hash for 'admin123' (will be generated in code properly)
