import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  comment: string;
  createdAt?: Date;
}

export interface IComponent extends Document {
  name: string;
  category: string;
  vendor: string;
  pinCount: number;
  specifications: Record<string, any>;
  inStock: boolean;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    comment: { type: String, required: [true, 'Comment is required'], trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ComponentSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Component name is required'], 
      trim: true 
    },
    category: { 
      type: String, 
      required: [true, 'Category is required'],
      index: true 
    },
    vendor: { 
      type: String, 
      required: [true, 'Vendor name is required'] 
    },
    pinCount: { 
      type: Number, 
      default: 0 
    },
    specifications: { 
      type: Schema.Types.Mixed, 
      default: {} 
    },
    inStock: { 
      type: Boolean, 
      default: true 
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  }, 
  { 
    timestamps: true 
  }
);

export default mongoose.model<IComponent>('Component', ComponentSchema);