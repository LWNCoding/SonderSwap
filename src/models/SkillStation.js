import mongoose from 'mongoose';

const skillStationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String, required: true }],
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  equipment: [{ type: String }],
  requirements: [{ type: String }],
  difficulty: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels'
  },
  duration: { type: Number, required: true }, // in minutes
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
skillStationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SkillStation = mongoose.model('SkillStation', skillStationSchema);

export { SkillStation };
export default SkillStation;
