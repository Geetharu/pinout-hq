// backend-engine/src/queues/componentQueue.ts
import { Queue } from 'bullmq';
import { bullMqConnection } from '../config/redis';

export interface ComponentJobData {
  componentId?: string;
  vendorName?: string;
  url?: string;
  jobType: 'SCRAPE_AND_GENERATE' | 'REGENERATE_ONLY';
}

export const componentQueue = new Queue<ComponentJobData>('hardware-editorial-queue', {
  connection: bullMqConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000, // Wait 60 seconds before retrying if Google throws a 429 quota limit
    },
    removeOnComplete: {
      age: 86400, // Keep completed job logs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // Keep failed job logs for 7 days for debugging
    },
  },
});

export async function addComponentJob(data: ComponentJobData, priority: number = 5) {
  const jobName = `${data.jobType}_${data.componentId || data.vendorName || 'bulk'}_${Date.now()}`;
  const job = await componentQueue.add(jobName, data, { priority });
  console.log(`[QUEUE] Job added successfully: ID=${job.id} Name=${jobName}`);
  return job;
}