import mongoose, { Schema, Document } from 'mongoose';

export interface IComponent extends Document {
  name: string;
  category: string;
  vendor: string;
  pinCount: number;
  specifications: Record<string, any>;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  }, 
  { 
    timestamps: true 
  }
);

export default mongoose.model<IComponent>('Component', ComponentSchema);