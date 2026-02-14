const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register/player', authController.registerPlayer);
router.post('/login/player', authController.loginPlayer);
router.post('/register/team-owner', authController.registerTeamOwner);
router.post('/login/team-owner', authController.loginTeamOwner);
router.post('/login/admin', authController.loginAdmin);
router.post('/login', authController.login);

module.exports = router;
