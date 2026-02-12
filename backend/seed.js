const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log("Seeding started...");

        // 1. Clear existing data (optional, but good for reset)
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('TRUNCATE TABLE transactions');
        await pool.query('TRUNCATE TABLE auction_sessions');
        await pool.query('TRUNCATE TABLE players');
        await pool.query('TRUNCATE TABLE team_owners');
        await pool.query('TRUNCATE TABLE admins');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Create Admin
        const adminHash = await bcrypt.hash('admin123', 10);
        await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', adminHash]);
        console.log("Admin created: admin / admin123");

        // 3. Create 5 Teams
        const teamHash = await bcrypt.hash('team123', 10);
        const teams = [
            { name: 'Soul Esports', user: 'soul_owner', logo: 'https://placehold.co/100x100?text=Soul' },
            { name: 'GodLike Esports', user: 'godl_owner', logo: 'https://placehold.co/100x100?text=GodL' },
            { name: 'Team XSpark', user: 'tx_owner', logo: 'https://placehold.co/100x100?text=TX' },
            { name: 'Global Esports', user: 'ge_owner', logo: 'https://placehold.co/100x100?text=GE' },
            { name: 'Blind Esports', user: 'blind_owner', logo: 'https://placehold.co/100x100?text=Blind' }
        ];

        for (const t of teams) {
            await pool.query(
                'INSERT INTO team_owners (username, password, team_name, team_logo, budget) VALUES (?, ?, ?, ?, ?)',
                [t.user, teamHash, t.name, t.logo, 10000000.00] // 1 Crore budget
            );
        }
        console.log("5 Teams created with password 'team123'");

        // 4. Create 10 Players
        const playerHash = await bcrypt.hash('player123', 10);
        const players = [
            { name: 'Jonathan', role: 'Assaulter', tier: 'Conqueror', kd: 6.5, exp: 4, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Mortal', role: 'IGL', tier: 'Ace Master', kd: 4.2, exp: 5, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Scout', role: 'Assaulter', tier: 'Conqueror', kd: 5.8, exp: 5, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'ClutchGod', role: 'IGL', tier: 'Ace Dominator', kd: 4.5, exp: 3, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Zgod', role: 'Support', tier: 'Ace', kd: 3.8, exp: 3, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Neyoo', role: 'Assaulter', tier: 'Crown', kd: 4.0, exp: 2, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Snax', role: 'Assaulter', tier: 'Conqueror', kd: 5.2, exp: 4, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Mavi', role: 'IGL', tier: 'Ace Master', kd: 3.5, exp: 5, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Viper', role: 'Support', tier: 'Ace', kd: 3.0, exp: 5, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
            { name: 'Regaltos', role: 'Assaulter', tier: 'Ace Dominator', kd: 4.8, exp: 4, video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' }
        ];

        for (const p of players) {
            await pool.query(
                'INSERT INTO players (username, password, name, role, tier, kd_ratio, experience_years, tournament_history, video_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [p.name.toLowerCase(), playerHash, p.name, p.role, p.tier, p.kd, p.exp, 'PMGC Finalist, BMPS Winner', p.video]
            );
        }
        console.log("10 Players created with password 'player123'");

        console.log("✅ Seeding completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seed();
