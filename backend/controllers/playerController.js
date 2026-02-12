const pool = require('../config/db');

exports.getAllPlayers = async (req, res) => {
  try {
    const [players] = await pool.query('SELECT * FROM players');
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const [players] = await pool.query('SELECT * FROM players WHERE id = ?', [req.params.id]);
    if (players.length === 0) return res.status(404).json({ message: 'Player not found' });
    res.json(players[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlayer = async (req, res) => {
  // Update fields like tier, KD, role, video_link
  const { name, role, tier, kd_ratio, experience_years, tournament_history, video_link } = req.body;
  try {
    await pool.query(
      'UPDATE players SET name = ?, role = ?, tier = ?, kd_ratio = ?, experience_years = ?, tournament_history = ?, video_link = ? WHERE id = ?',
      [name, role, tier, kd_ratio, experience_years, tournament_history, video_link, req.params.id]
    );
    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
