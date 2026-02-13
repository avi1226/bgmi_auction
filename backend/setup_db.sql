-- Database Schema for BGMI Player Auction System

DROP DATABASE IF EXISTS bgmi_auction_db;
CREATE DATABASE bgmi_auction_db;

USE bgmi_auction_db;

-- Admins Table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Owners Table
CREATE TABLE team_owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    team_logo VARCHAR(255),
    budget DECIMAL(10, 2) DEFAULT 10000000.00, -- Default budget example: 1 Crore
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players Table
CREATE TABLE players (
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
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES team_owners(id) ON DELETE SET NULL
);

-- Auction Sessions Table (Manage live auction state)
CREATE TABLE auction_sessions (
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
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    player_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES team_owners(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- SEED DATA 
-- Passwords are generated using bcrypt

INSERT INTO admins (username, password) VALUES 
('admin', '$2b$10$jc1bDJAH8MvBbjGJOKYWfOhoJqjr6C8fOmtU.TVaVQAOrpJeZ7cT6'); -- admin123 

INSERT INTO team_owners (username, password, team_name, budget) VALUES 
('soul_owner', '$2b$10$N4h7rP5BRXkPOODg5iQgju7eLOMPIFqRFHbjbtMX89FwKihUP6ere', 'Soul Esports', 10000000.00), -- team123
('godl_owner', '$2b$10$N4h7rP5BRXkPOODg5iQgju7eLOMPIFqRFHbjbtMX89FwKihUP6ere', 'GodLike', 10000000.00); -- team123

INSERT INTO players (username, password, name, role, tier, kd_ratio, experience_years, video_link) VALUES 
('jonathan', '$2b$10$xqIWIbq/4c0XmPqudA/Lqudn/CeY/vIQrtZMNkB1MxbBnZovnoiBi', 'Jonathan', 'Assaulter', 'Conqueror', 6.5, 4, 'https://www.youtube.com/watch?v=ScMzIvxBSi4'), -- player123
('mortal', '$2b$10$xqIWIbq/4c0XmPqudA/Lqudn/CeY/vIQrtZMNkB1MxbBnZovnoiBi', 'Mortal', 'IGL', 'Ace Master', 4.2, 5, 'https://www.youtube.com/watch?v=ScMzIvxBSi4'); -- player123
