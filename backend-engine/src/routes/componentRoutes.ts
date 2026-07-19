import { Router } from 'express';
import { getComponents, getComponentById, createComponent, scrapeAndSaveComponent, regenerateComponent } from '../controllers/componentController';
import { triggerBulkRegeneration } from '../controllers/queueController';

const router = Router();

router.route('/')
  .get(getComponents)
  .post(createComponent);

router.route('/scrape')
  .post(scrapeAndSaveComponent);

// Background job queue endpoint for bulk AI regeneration
router.route('/bulk-regenerate')
  .post(triggerBulkRegeneration);

// Route for individual SEO hardware pages
router.route('/:id')
  .get(getComponentById);

// Pro model regeneration endpoint
router.route('/:id/regenerate')
  .post(regenerateComponent);

export default router;