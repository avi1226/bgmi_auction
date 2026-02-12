const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamOwner', required: true },
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  amount: { type: Number, required: true },
  transaction_date: { type: Date, default: Date.now },
}, { timestamps: true });

TransactionSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
