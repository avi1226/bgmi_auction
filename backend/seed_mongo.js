const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const TeamOwner = require('./models/TeamOwner');
const Player = require('./models/Player');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // Clear existing
        await Admin.deleteMany({});
        await TeamOwner.deleteMany({});
        await Player.deleteMany({});
        console.log("Data cleared.");

        // Create Admin
        const adminHash = await bcrypt.hash('admin123', 10);
        await Admin.create({ username: 'admin', password: adminHash });
        console.log("Admin created.");

        // Create Teams
        const teamHash = await bcrypt.hash('team123', 10);
        const teams = [
            { username: 'soul_owner', name: 'Soul Esports', logo: 'https://placehold.co/100x100?text=Soul' },
            { username: 'godl_owner', name: 'GodLike', logo: 'https://placehold.co/100x100?text=GodL' },
            { username: 'tx_owner', name: 'Team XSpark', logo: 'https://placehold.co/100x100?text=TX' }
        ];

        for (const t of teams) {
            await TeamOwner.create({
                username: t.username,
                password: teamHash,
                team_name: t.name,
                team_logo: t.logo,
                budget: 10000000
            });
        }
        console.log("Teams created.");

        // Create Players
        const playerHash = await bcrypt.hash('player123', 10);
        const players = [
            { name: 'Jonathan', role: 'Assaulter', tier: 'Conqueror', kd: 6.5, exp: 4, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Mortal', role: 'IGL', tier: 'Ace Master', kd: 4.2, exp: 5, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Scout', role: 'Assaulter', tier: 'Conqueror', kd: 5.8, exp: 5, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' }
        ];

        for (const p of players) {
            await Player.create({
                username: p.name.toLowerCase(),
                password: playerHash,
                name: p.name,
                role: p.role,
                tier: p.tier,
                kd_ratio: p.kd,
                experience_years: p.exp,
                tournament_history: 'PMGC Finalist',
                video_link: p.video
            });
        }
        console.log("Players created.");

        console.log("✅ Seeding Complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seed();
