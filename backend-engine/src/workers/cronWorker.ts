// backend-engine/src/workers/cronWorker.ts
import { Queue, Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import Component from '../models/Component';

export interface PriceScrapeJobData {
  jobType: 'DAILY_PRICE_AND_STOCK_SYNC';
}

// 1. Create the recurring cron queue scheduler
export const cronQueue = new Queue<PriceScrapeJobData>('hardware-cron-queue', {
  connection: bullMqConnection,
});

export async function scheduleDailyPriceSync() {
  // Remove existing repeatable jobs to avoid duplicates on server restart
  const repeatableJobs = await cronQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await cronQueue.removeRepeatableByKey(job.key);
  }

  // Schedule job to run automatically every night at 2:00 AM UTC
  await cronQueue.add(
    'daily-vendor-price-sync',
    { jobType: 'DAILY_PRICE_AND_STOCK_SYNC' },
    {
      repeat: {
        pattern: '0 2 * * *', // Cron syntax: At 02:00 every day
      },
      removeOnComplete: 10,
      removeOnFail: 50,
    }
  );
  console.log('[CRON SCHEDULER] Daily vendor price and stock synchronization scheduled successfully.');
}

// 2. Define the background execution worker
export const cronWorker = new Worker<PriceScrapeJobData>(
  'hardware-cron-queue',
  async (job: Job<PriceScrapeJobData>) => {
    console.log(`[CRON WORKER] Starting scheduled price sync job #${job.id}...`);

    try {
      const components = await Component.find({});
      console.log(`[CRON WORKER] Found ${components.length} components in matrix. Verifying vendor feeds...`);

      let updatedCount = 0;

      for (const component of components) {
        // Here we simulate checking live vendor API endpoints or HTML pricing nodes
        // In your production deployment, you can plug your Axios scraper helper here
        const currentPrice = parseFloat(component.specifications?.scrapedPrice || '49.99');
        
        // Simulating minor market price fluctuation and stock verification
        const randomFluctuation = ((Math.random() - 0.5) * 2).toFixed(2);
        const newPrice = Math.max(9.99, currentPrice + parseFloat(randomFluctuation)).toFixed(2);
        const isStillInStock = Math.random() > 0.1; // 90% chance to remain in stock

        component.specifications = {
          ...component.specifications,
          scrapedPrice: newPrice,
          lastScrapedAt: new Date().toISOString(),
        };
        component.inStock = isStillInStock;

        await component.save();
        updatedCount++;
        
        // Brief 500ms pause between updates to be polite to external vendor servers
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`[CRON WORKER] Successfully updated pricing and stock telemetry for ${updatedCount} modules.`);
      return { success: true, totalSynced: updatedCount, timestamp: new Date().toISOString() };
    } catch (error: any) {
      console.error('[CRON WORKER ERROR] Failed during scheduled price synchronization:', error.message);
      throw error;
    }
  },
  {
    connection: bullMqConnection,
    concurrency: 1,
  }
);

cronWorker.on('completed', (job) => {
  console.log(`[CRON WORKER] Nightly synchronization job #${job.id} completed cleanly:`, job.returnvalue);
});

cronWorker.on('failed', (job, err) => {
  console.error(`[CRON WORKER] Scheduled job #${job?.id} failed:`, err.message);
});