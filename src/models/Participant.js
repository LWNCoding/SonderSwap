import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillStation' },
  status: { 
    type: String, 
    enum: ['registered', 'attended', 'completed', 'cancelled'],
    default: 'registered'
  },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
participantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index to prevent duplicate registrations
participantSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);

export { Participant };
export default Participant;
