const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerPlayer = async (req, res) => {
  const { username, password, name, role, tier, kd_ratio, experience_years, tournament_history, video_link } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO players (username, password, name, role, tier, kd_ratio, experience_years, tournament_history, video_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, name, role, tier, kd_ratio, experience_years, tournament_history, video_link]
    );
    res.status(201).json({ message: 'Player registered successfully', playerId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginPlayer = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM players WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    
    const player = rows[0];
    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: player.id, role: 'player' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: 'player', player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registerTeamOwner = async (req, res) => {
  const { username, password, team_name, team_logo } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO team_owners (username, password, team_name, team_logo) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, team_name, team_logo]
    );
    res.status(201).json({ message: 'Team Owner registered successfully', ownerId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginTeamOwner = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM team_owners WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    
    const owner = rows[0];
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: owner.id, role: 'team_owner' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: 'team_owner', owner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    
    const admin = rows[0];
    // For simplicity, plain text check for initial admin seed, but hash check normally
    // Assuming seeded admin uses bcrypt too as per schema seed comment
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: 'admin', admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
