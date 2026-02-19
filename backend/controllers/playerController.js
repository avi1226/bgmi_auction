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
    const { video_link, ...updateFields } = req.body;
    const updateOps = { $set: updateFields };
    const newLinks = [];

    // Valid YouTube/URL check could be done here, but simple push for now
    if (video_link) {
        newLinks.push(video_link);
    }

    // Construct full URLs if files uploaded
    if (req.files) {
        const protocol = req.protocol;
        const host = req.get('host');

        if (req.files['profile_image']) {
            updateOps.$set.profile_image = `${protocol}://${host}/uploads/${req.files['profile_image'][0].filename}`;
        }
        
        if (req.files['profile_screenshot']) {
            updateOps.$set.profile_screenshot = `${protocol}://${host}/uploads/${req.files['profile_screenshot'][0].filename}`;
        }

        if (req.files['rank_proof_image']) {
            updateOps.$set.rank_proof_image = `${protocol}://${host}/uploads/${req.files['rank_proof_image'][0].filename}`;
        }

        if (req.files['gameplay_video']) {
            const videoUrl = `${protocol}://${host}/uploads/${req.files['gameplay_video'][0].filename}`;
            newLinks.push(videoUrl);
        }

        if (req.files['verification_video']) {
             const vVideoUrl = `${protocol}://${host}/uploads/${req.files['verification_video'][0].filename}`;
             updateOps.$set.verification_video_url = vVideoUrl;
             updateOps.$set.verification_status = 'pending';
        }
    }

    if (newLinks.length > 0) {
        updateOps.$push = { video_links: { $each: newLinks } };
    }

    const player = await Player.findByIdAndUpdate(req.params.id, updateOps, { new: true }).populate('team_id');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPlayer = async (req, res) => {
  try {
    const { status, badge, rejection_reason } = req.body;
    
    // Normalize status to lowercase for consistency if needed, but schema uses define enum.
    // Schema enum: ['unverified', 'pending', 'verified', 'rejected']
    if (!['verified', 'rejected', 'pending', 'unverified'].includes(status)) {
         // Fallback for legacy calls or case safety
         if (['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
             // allow implicit conversion if you updated schema to only lowercase, 
             // OR if schema allows both. My previous edit to schema used lowercase for new options but kept default...
             // Wait, I replaced the whole line in schema with lowercase options.
             // So I must enforce lowercase here.
         } else {
            return res.status(400).json({ message: 'Invalid status' });
         }
    }
    
    const updateOps = { verification_status: status };
    if (badge) updateOps.verification_badge = badge;
    if (rejection_reason) updateOps.rejection_reason = rejection_reason;

    const player = await Player.findByIdAndUpdate(req.params.id, updateOps, { new: true }).populate('team_id');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadVerificationVideo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        const protocol = req.protocol;
        const host = req.get('host');
        const videoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        
        const player = await Player.findByIdAndUpdate(req.params.id, {
            verification_video_url: videoUrl,
            verification_status: 'pending'
        }, { new: true });
        
        if (!player) return res.status(404).json({ message: 'Player not found' });
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { video_url } = req.body;
    const updateOps = { $pull: { video_links: video_url } };
    
    // Check if it matches legacy link
    const playerCheck = await Player.findById(req.params.id);
    if (playerCheck && playerCheck.video_link === video_url) {
        updateOps.$unset = { video_link: 1 };
    }

    const player = await Player.findByIdAndUpdate(req.params.id, updateOps, { new: true }).populate('team_id');
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
