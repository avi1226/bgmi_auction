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

// Update player (fields and uploads)
router.put('/:id', upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'gameplay_video', maxCount: 1 },
    { name: 'profile_screenshot', maxCount: 1 },
    { name: 'rank_proof_image', maxCount: 1 },
    { name: 'verification_video', maxCount: 1 }
]), playerController.updatePlayer);

// Upload verification video specific endpoint (optional if users want a separate step)
router.post('/:id/verify-upload', upload.single('verification_video'), playerController.uploadVerificationVideo);

// Delete video
router.put('/:id/video/delete', playerController.deleteVideo);

// Verify player endpoint
router.put('/:id/verify', playerController.verifyPlayer);

// Get players by team
router.get('/team/:teamId', playerController.getPlayersByTeam);

// Release player from team
router.post('/:id/release', playerController.releasePlayer);

module.exports = router;
