// backend-engine/src/controllers/queueController.ts
import { Request, Response } from 'express';
import { addComponentJob } from '../queues/componentQueue';
import Component from '../models/Component';

export const triggerBulkRegeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentIds } = req.body;

    if (!Array.isArray(componentIds) || componentIds.length === 0) {
      res.status(400).json({ success: false, message: 'You must provide an array of componentIds.' });
      return;
    }

    const queuedJobs = [];

    for (const id of componentIds) {
      const exists = await Component.exists({ _id: id });
      if (exists) {
        const job = await addComponentJob({
          componentId: id,
          jobType: 'REGENERATE_ONLY',
        }, 5);
        queuedJobs.push({ id, jobId: job.id });
      }
    }

    res.status(202).json({
      success: true,
      message: `Successfully queued ${queuedJobs.length} components for background Pro AI generation.`,
      jobs: queuedJobs,
    });
  } catch (error: any) {
    console.error('[QUEUE CONTROLLER ERROR]', error);
    res.status(500).json({ success: false, message: 'Failed to add jobs to queue.', error: error.message });
  }
};