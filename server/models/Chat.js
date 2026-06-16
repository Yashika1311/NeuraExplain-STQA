const mongoose = require("mongoose");

// Define the chat modes
const CHAT_MODES = {
  STUDY: 'study',
  CODING: 'coding',
  GENERAL: 'general',
  EMOTIONAL_SUPPORT: 'emotional_support',
  CREATIVE: 'creative',
  ANALYTICAL: 'analytical'
};

// Define explanation schema
const ExplanationSchema = new mongoose.Schema({
  reasoning: { type: String, required: true },
  steps: [{ 
    step: { type: String, required: true },
    description: { type: String, required: true }
  }],
  confidence: { 
    type: Number, 
    required: true,
    min: 0,
    max: 1,
    default: 0.8 
  },
  references: [{
    title: String,
    url: String,
    snippet: String
  }],
  additionalInfo: mongoose.Schema.Types.Mixed
}, { _id: false });

const ChatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  mode: {
    type: String,
    enum: Object.values(CHAT_MODES),
    required: true,
    default: CHAT_MODES.STUDY
  },
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 1000
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  explanation: {
    type: ExplanationSchema,
    required: true
  },
  metadata: {
    tokens: {
      prompt: Number,
      completion: Number,
      total: Number
    },
    model: String,
    processingTime: Number, // in milliseconds
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ChatSchema.index({ userId: 1, createdAt: -1 });
ChatSchema.index({ userId: 1, mode: 1, createdAt: -1 });

// Add a virtual for formatted date
ChatSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get available chat modes
ChatSchema.statics.getModes = function() {
  return { ...CHAT_MODES };
};

// Pre-save hook to update metadata
// ChatSchema.pre('save', function(next) {
//   if (this.isNew) {
//     // Set default metadata if not provided
//     if (!this.metadata) {
//       this.metadata = {};
//     }
    
//     // Set default model if not provided
//     if (!this.metadata.model) {
//       this.metadata.model = 'neura-explain-v1';
//     }
//   }
//   next();
// });

const Chat = mongoose.model('Chat', ChatSchema);

// Export the model and constants
module.exports = {
  Chat,
  CHAT_MODES
};
