import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  expertise: [{ type: String, required: true }],
  profileImage: { type: String },
  email: { type: String },
  website: { type: String },
  socialMedia: {
    linkedin: { type: String },
    twitter: { type: String },
    github: { type: String }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
speakerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Speaker = mongoose.model('Speaker', speakerSchema);

export { Speaker };
export default Speaker;
