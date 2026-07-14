import { z } from 'zod';
import * as cheerio from 'cheerio';

// 1. Define strict validation rules for incoming scraping requests from n8n / MCP
export const ScrapeVendorInputSchema = z.object({
  url: z.string().url(),
  vendorName: z.string(),
  selectors: z.object({
    priceContainer: z.string().optional(),
    stockIndicator: z.string().optional(),
    titleElement: z.string().optional(),
  }).optional()
});

export type ScrapeVendorParams = z.infer<typeof ScrapeVendorInputSchema>;

export interface ScrapeResult {
  success: boolean;
  vendorName: string;
  url: string;
  extractedTitle?: string;
  price?: number;
  currency: string;
  inStock: boolean;
  rawSpecifications: Record<string, string>;
  error?: string;
  executionTimeMs: number;
}

/**
 * Executes a high-performance, anti-detection web scrape against a hardware vendor
 */
export async function executeVendorScrape(params: ScrapeVendorParams): Promise<ScrapeResult> {
  const startTime = Date.now();
  
  // Configure realistic browser headers to bypass basic bot detection scripts
  const customHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  // Set an 8-second abort timer so hanging vendor sites never freeze our automation pipeline
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(params.url, {
      method: 'GET',
      headers: customHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Vendor server returned HTTP status ${response.status}`);
    }

    const htmlContent = await response.text();
    const $ = cheerio.load(htmlContent);

    // Extract product title
    const titleSelector = params.selectors?.titleElement || 'h1, .product-title, .product-name';
    const extractedTitle = $(titleSelector).first().text().trim();

    // Extract and sanitize numeric pricing
    const priceSelector = params.selectors?.priceContainer || '.price, .product-price, [itemprop="price"]';
    const rawPriceText = $(priceSelector).first().text().replace(/[^0-9.]/g, '');
    const parsedPrice = rawPriceText ? parseFloat(rawPriceText) : undefined;

    // Detect stock availability based on common vendor button labels
    const pageText = $('body').text().toLowerCase();
    const isOutOfStock = pageText.includes('out of stock') || pageText.includes('sold out') || pageText.includes('backorder');
    const inStock = !isOutOfStock;

    // Extract structured specification tables automatically into key-value pairs
    const rawSpecifications: Record<string, string> = {};
    $('table tr, .spec-row, .technical-specs li').each((_, element) => {
      const key = $(element).find('th, .spec-label, strong').first().text().trim();
      const value = $(element).find('td, .spec-value, span').last().text().trim();
      if (key && value && key !== value) {
        rawSpecifications[key] = value;
      }
    });

    return {
      success: true,
      vendorName: params.vendorName,
      url: params.url,
      extractedTitle: extractedTitle || undefined,
      price: parsedPrice,
      currency: 'USD',
      inStock,
      rawSpecifications,
      executionTimeMs: Date.now() - startTime
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      vendorName: params.vendorName,
      url: params.url,
      currency: 'USD',
      inStock: false,
      rawSpecifications: {},
      error: error.message || 'Unknown scraping failure occurred',
      executionTimeMs: Date.now() - startTime
    };
  }
}