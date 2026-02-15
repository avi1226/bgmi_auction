const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['IGL', 'Assaulter', 'Support', 'Sniper'], required: true },
  tier: { type: String, required: true },
  kd_ratio: { type: Number, required: true },
  experience_years: { type: Number, required: true },
  tournament_history: { type: String },
  video_links: { type: [String], default: [] },
  video_link: { type: String },
  profile_image: { type: String },
  is_sold: { type: Boolean, default: false },
  sold_price: { type: Number, default: 0 },
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamOwner', default: null },
  base_price: { type: Number, default: 50000.00 },
  verification_status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true, id: true }); // Enable virtual id

PlayerSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Player', PlayerSchema);
