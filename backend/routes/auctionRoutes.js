const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.post('/start', auctionController.startAuction); // Admin only protect in middleware
router.post('/join', auctionController.joinAuction);   // Team Owner verify code
router.post('/bid', auctionController.placeBid);       // Team Owner only protect in middleware
router.post('/stop', auctionController.stopAuction);   // Admin only protect in middleware
router.get('/state', auctionController.getAuctionState); // Public (or authenticated)

module.exports = router;
