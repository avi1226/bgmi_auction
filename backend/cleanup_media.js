require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const result = await Player.updateMany({}, {
      $set: {
        video_links: [],
        video_link: null,
        profile_image: null,
        profile_screenshot: null,
        rank_proof_image: null,
        verification_video_url: null,
      }
    });
    console.log(`Updated ${result.modifiedCount} players to remove media links.`);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
