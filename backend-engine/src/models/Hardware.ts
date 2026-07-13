import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorOffer {
  vendorName: string;
  url: string;
  price: number;
  currency: string;
  inStock: boolean;
  affiliateUrl?: string;
  lastUpdated: Date;
}

export interface IHardware extends Document {
  slug: string;
  name: string;
  category: 'MCU' | 'SENSOR' | 'DISPLAY' | 'GPU' | 'SBC' | 'OTHER';
  brand: string;
  sku: string;
  overview: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  specifications: Record<string, any>;
  vendorOffers: IVendorOffer[];
  lowestPrice: number;
  isAvailable: boolean;
  isSponsored: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorOfferSchema = new Schema<IVendorOffer>({
  vendorName: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  inStock: { type: Boolean, default: false },
  affiliateUrl: { type: String },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const HardwareSchema = new Schema<IHardware>({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['MCU', 'SENSOR', 'DISPLAY', 'GPU', 'SBC', 'OTHER'],
    index: true 
  },
  brand: { type: String, required: true, index: true },
  sku: { type: String, required: true, uppercase: true, trim: true },
  overview: { type: String, required: true },
  seo: {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: [{ type: String }]
  },
  specifications: { type: Schema.Types.Mixed, default: {} },
  vendorOffers: [VendorOfferSchema],
  lowestPrice: { type: Number, required: true, index: true, default: 0 },
  isAvailable: { type: Boolean, default: false, index: true },
  isSponsored: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  minimize: false
});

HardwareSchema.index({ category: 1, isSponsored: -1, lowestPrice: 1, isAvailable: -1 });
HardwareSchema.index({ category: 1, brand: 1 });
HardwareSchema.index({ "specifications.$**": 1 });

HardwareSchema.pre<IHardware>('save', function(next) {
  if (this.vendorOffers && this.vendorOffers.length > 0) {
    const activeOffers = this.vendorOffers.filter(o => o.inStock && o.price > 0);
    if (activeOffers.length > 0) {
      this.lowestPrice = Math.min(...activeOffers.map(o => o.price));
      this.isAvailable = true;
    } else {
      this.lowestPrice = Math.min(...this.vendorOffers.map(o => o.price));
      this.isAvailable = false;
    }
  } else {
    this.lowestPrice = 0;
    this.isAvailable = false;
  }
  next();
});

export const Hardware = mongoose.model<IHardware>('Hardware', HardwareSchema);