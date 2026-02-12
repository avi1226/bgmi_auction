const pool = require('../config/db');

exports.getAllTeams = async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM team_owners');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const [teams] = await pool.query('SELECT * FROM team_owners WHERE id = ?', [req.params.id]);
    if (teams.length === 0) return res.status(404).json({ message: 'Team not found' });
    res.json(teams[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
