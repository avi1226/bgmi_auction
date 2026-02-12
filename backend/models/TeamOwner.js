const mongoose = require('mongoose');

const TeamOwnerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  team_name: { type: String, required: true, unique: true },
  team_logo: { type: String },
  budget: { type: Number, default: 10000000.00 },
}, { timestamps: true, id: true });

TeamOwnerSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('TeamOwner', TeamOwnerSchema);
