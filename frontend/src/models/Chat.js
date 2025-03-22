import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system', 'doctor'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  messages: [messageSchema],
  currentSymptoms: {
    type: String,
    required: true
  },
  aiResponse: {
    diagnosis: String,
    confidence: Number,
    recommendations: String,
    warnings: String,
    timestamp: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  doctorReview: {
    approved: Boolean,
    notes: String,
    reviewDate: Date
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  aiModel: {
    type: String,
    required: true,
    default: 'gpt-4'
  }
}, {
  timestamps: true
});

chatSchema.index({ patientId: 1, createdAt: -1 });
chatSchema.index({ doctorId: 1, status: 1 });
chatSchema.index({ status: 1, isUrgent: -1, createdAt: -1 });

chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

chatSchema.virtual('patient', {
  ref: 'Patient',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

chatSchema.virtual('doctor', {
  ref: 'Doctor',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);