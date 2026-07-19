// backend-engine/src/workers/componentWorker.ts
import { Worker, Job } from 'bullmq';
import { bullMqConnection } from '../config/redis';
import { ComponentJobData } from '../queues/componentQueue';
import Component from '../models/Component';
import { generateDynamicArticleAI } from '../controllers/componentController';

export const componentWorker = new Worker<ComponentJobData>(
  'hardware-editorial-queue',
  async (job: Job<ComponentJobData>) => {
    console.log(`[WORKER] Starting job #${job.id} (${job.data.jobType})...`);
    
    const { componentId, jobType } = job.data;

    if (jobType === 'REGENERATE_ONLY' && componentId) {
      // Cast to any to bypass Mongoose strict interface checks on dynamic AI fields
      const component: any = await Component.findById(componentId);
      if (!component) {
        throw new Error(`Component with ID ${componentId} not found in MongoDB.`);
      }

      console.log(`[WORKER] Processing background regeneration for "${component.name}" via Pro AI...`);
      
      // Pass the exact three arguments required by your controller signature
      const aiContent = await generateDynamicArticleAI(
        component.name || 'Unknown Module',
        component.vendor || 'Generic Vendor',
        component.specs || {}
      );
      
      component.articleMarkdown = aiContent.articleMarkdown;
      component.faqSection = aiContent.faqSection;
      component.metaDescription = aiContent.metaDescription;
      component.tags = aiContent.tags;
      component.lastRegeneratedAt = new Date();
      component.regeneratedBy = process.env.PRIMARY_AI_MODEL || 'gemini-3.1-pro';
      component.wordCount = (aiContent.articleMarkdown || '').split(/\s+/).length;

      await component.save();
      console.log(`[WORKER] Successfully generated and persisted 1500+ word review for "${component.name}".`);
      return { success: true, componentId: component._id, wordCount: component.wordCount };
    }

    throw new Error(`Job type ${jobType} is either unrecognized or missing required payload data.`);
  },
  {
    connection: bullMqConnection,
    concurrency: 1, // Process one article at a time to strictly protect Google Pro API rate limits
    limiter: {
      max: 10,      // Maximum 10 jobs processed per duration window
      duration: 60000, // Per 60 seconds
    },
  }
);

componentWorker.on('completed', (job) => {
  console.log(`[WORKER] Job #${job.id} completed successfully with return value:`, job.returnvalue);
});

componentWorker.on('failed', (job, err) => {
  console.error(`[WORKER] Job #${job?.id} failed with error:`, err.message);
});