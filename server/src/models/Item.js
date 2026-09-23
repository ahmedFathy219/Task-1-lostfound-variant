import mongoose from 'mongoose';
// TODO: define the Item schema per README.md section 1.

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String},
    category: { type: String, enum: ['electronics', 'clothing', 'documents', 'accessories', 'other'], default: 'other'},
    status: { type: String, enum: ['lost', 'found', 'claimed'], default: 'lost'},
    location: {type: String},
    reportedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null}
  },
  { timestamps: true }
);

// TODO: add the uniqueness constraint described in README.md section 1.
// Compound Unique Index
itemSchema.index({ title: 1, location: 1 }, { unique: true });

export const Item = mongoose.model('Item', itemSchema);
