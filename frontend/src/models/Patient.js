import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  allergies: [{
    type: String,
    default: ''
  }],
  currentMedications: [{
    type: String,
    default: ''
  }],
  chronicConditions: [{
    type: String,
    default: ''
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema);