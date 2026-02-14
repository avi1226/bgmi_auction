const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/', playerController.getAllPlayers);
router.get('/:id', playerController.getPlayerById);
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Update player
router.put('/:id', upload.single('profile_image'), playerController.updatePlayer);

// Verify player endpoint
router.put('/:id/verify', playerController.verifyPlayer);

// Get players by team
router.get('/team/:teamId', playerController.getPlayersByTeam);

module.exports = router;
