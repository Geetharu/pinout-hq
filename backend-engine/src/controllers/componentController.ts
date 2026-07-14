import { Request, Response } from 'express';
import Component from '../models/Component';
import { executeVendorScrape, ScrapeVendorInputSchema } from '../services/scrapeVendor'; 
// Note: If your scrapeVendor file is in a different folder like '../utils/scrapeVendor', adjust the import path above!

export const getComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    const components = await Component.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      success: true, 
      count: components.length, 
      data: components 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching components', 
      error: error.message 
    });
  }
};

export const createComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const newComponent = await Component.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: newComponent 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: 'Failed to create component', 
      error: error.message 
    });
  }
};

/**
 * Autonomous Automation Route: Scrapes a vendor URL and syncs specs to MongoDB
 */
export const scrapeAndSaveComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate incoming request body using your strict Zod schema
    const validation = ScrapeVendorInputSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid scraping parameters provided',
        errors: validation.error.format() 
      });
      return;
    }

    const params = validation.data;
    console.log(`⚡ Initializing autonomous scrape for vendor: [${params.vendorName}] at ${params.url}`);
    
    // 2. Execute the Cheerio web scrape
    const scrapeResult = await executeVendorScrape(params);

    if (!scrapeResult.success) {
      res.status(502).json({ 
        success: false, 
        message: 'Scraper failed to extract data from vendor website', 
        error: scrapeResult.error,
        executionTimeMs: scrapeResult.executionTimeMs
      });
      return;
    }

    // 3. Map scraped data into your MongoDB Component Schema format
    const componentName = scrapeResult.extractedTitle || `Scraped Hardware (${params.vendorName})`;
    const componentData = {
      name: componentName,
      category: 'Scraped Hardware Module',
      vendor: params.vendorName,
      pinCount: 0, // Can be parsed dynamically later from specs if available
      specifications: {
        ...scrapeResult.rawSpecifications,
        sourceUrl: params.url,
        scrapedPrice: scrapeResult.price,
        currency: scrapeResult.currency,
        lastScrapedAt: new Date().toISOString()
      },
      inStock: scrapeResult.inStock
    };

    // 4. Save or update in MongoDB (uses vendor and name to prevent duplicate records)
    const savedComponent = await Component.findOneAndUpdate(
      { vendor: params.vendorName, name: componentName },
      componentData,
      { new: true, upsert: true }
    );

    console.log(`✅ Successfully synced [${componentName}] to MongoDB Atlas!`);

    res.status(200).json({
      success: true,
      message: 'Successfully scraped vendor and synced hardware specs with MongoDB',
      executionTimeMs: scrapeResult.executionTimeMs,
      data: savedComponent
    });

  } catch (error: any) {
    console.error('🔥 Fatal error during autonomous scraping pipeline:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during scrape pipeline', 
      error: error.message 
    });
  }
};