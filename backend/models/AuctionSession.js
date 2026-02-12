const mongoose = require('mongoose');

const AuctionSessionSchema = new mongoose.Schema({
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  current_bid: { type: Number, default: 0 },
  highest_bidder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamOwner' },
  status: { type: String, enum: ['PENDING', 'ONGOING', 'COMPLETED', 'UNSOLD'], default: 'PENDING' },
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date },
}, { timestamps: true });

AuctionSessionSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('AuctionSession', AuctionSessionSchema);
