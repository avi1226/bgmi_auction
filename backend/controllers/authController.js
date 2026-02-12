const Admin = require('../models/Admin');
const TeamOwner = require('../models/TeamOwner');
const Player = require('../models/Player');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerPlayer = async (req, res) => {
  const { username, password, name, role, tier, kd_ratio, experience_years, tournament_history, video_link } = req.body;
  try {
    const existing = await Player.findOne({ username });
    if(existing) return res.status(400).json({ message: 'Username taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const player = await Player.create({
        username, 
        password: hashedPassword, 
        name, 
        role, 
        tier, 
        kd_ratio, 
        experience_years, 
        tournament_history, 
        video_link
    });
    
    res.status(201).json({ message: 'Player registered successfully', playerId: player.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginPlayer = async (req, res) => {
  const { username, password } = req.body;
  try {
    const player = await Player.findOne({ username });
    if (!player) return res.status(401).json({ message: 'Invalid credentials' });
    
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
    const existing = await TeamOwner.findOne({ username });
    if(existing) return res.status(400).json({ message: 'Username taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = await TeamOwner.create({
        username, 
        password: hashedPassword, 
        team_name, 
        team_logo
    });

    res.status(201).json({ message: 'Team Owner registered successfully', ownerId: owner.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginTeamOwner = async (req, res) => {
  const { username, password } = req.body;
  try {
    const owner = await TeamOwner.findOne({ username });
    if (!owner) return res.status(401).json({ message: 'Invalid credentials' });
    
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
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: 'admin', admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
