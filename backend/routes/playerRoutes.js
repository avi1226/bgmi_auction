const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/', playerController.getAllPlayers);
router.get('/:id', playerController.getPlayerById);
// Update player
router.put('/:id', playerController.updatePlayer);

// Verify player endpoint
router.put('/:id/verify', playerController.verifyPlayer);

module.exports = router;
