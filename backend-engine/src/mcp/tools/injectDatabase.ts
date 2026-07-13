import { z } from 'zod';
import { Hardware } from '../../models/Hardware';
import { redisClient } from '../../config/redis';

export const InjectHardwareInputSchema = z.object({
  slug: z.string().describe("URL friendly unique identifier e.g. esp32-wroom-32d"),
  name: z.string().describe("Full product name"),
  category: z.enum(['MCU', 'SENSOR', 'DISPLAY', 'GPU', 'SBC', 'OTHER']),
  brand: z.string(),
  sku: z.string(),
  overview: z.string().describe("Cleaned technical summary for developers"),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string())
  }),
  specifications: z.record(z.any()).describe("Polymorphic key-value JSON containing technical specs"),
  vendorOffers: z.array(z.object({
    vendorName: z.string(),
    url: z.string().url(),
    price: z.number().positive(),
    currency: z.string().default("USD"),
    inStock: z.boolean(),
    affiliateUrl: z.string().optional()
  })),
  isSponsored: z.boolean().default(false)
});

export type InjectHardwareParams = z.infer<typeof InjectHardwareInputSchema>;

export async function executeDatabaseInjection(payload: InjectHardwareParams) {
  try {
    // 1. Upsert into MongoDB Atlas
    const updatedHardware = await Hardware.findOneAndUpdate(
      { slug: payload.slug },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    );

    // 2. Perform non blocking pattern cache invalidation using SCAN
    const patternsToInvalidate = [
      `hardware:item:${payload.slug}`,
      `hardware:list:${payload.category}:*`,
      `hardware:list:all:*`
    ];

    for (const pattern of patternsToInvalidate) {
      if (pattern.includes('*')) {
        let cursor = 0;
        do {
          const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
          cursor = reply.cursor;
          if (reply.keys.length > 0) {
            await redisClient.del(reply.keys);
          }
        } while (cursor !== 0);
      } else {
        await redisClient.del(pattern);
      }
    }

    return {
      success: true,
      action: updatedHardware?.isNew ? 'CREATED' : 'UPDATED',
      documentId: updatedHardware?._id,
      slug: updatedHardware?.slug,
      lowestPriceCalculated: updatedHardware?.lowestPrice,
      cacheInvalidated: true
    };
  } catch (error: any) {
    throw new Error(`Database Injection Failed: ${error.message}`);
  }
}