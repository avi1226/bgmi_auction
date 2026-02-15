const Player = require('../models/Player');

exports.getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate('team_id');
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('team_id');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePlayer = async (req, res) => {
  try {
// Construct full URL if file uploaded
    if (req.file) {
        // Assuming server runs on localhost or a known domain. 
        // For simplicity, we can use relative path '/uploads/filename'
        // But let's try to construct a full URL for consistency with external links
        const protocol = req.protocol;
        const host = req.get('host');
        req.body.profile_image = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('team_id');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPlayer = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    const player = await Player.findByIdAndUpdate(req.params.id, { verification_status: status }, { new: true }).populate('team_id');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlayersByTeam = async (req, res) => {
  try {
    const players = await Player.find({ team_id: req.params.teamId }).populate('team_id');
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
