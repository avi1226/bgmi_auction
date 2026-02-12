const TeamOwner = require('../models/TeamOwner');

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await TeamOwner.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await TeamOwner.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
