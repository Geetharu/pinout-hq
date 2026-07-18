import { Router } from 'express';
import { getComponents, getComponentById, createComponent, scrapeAndSaveComponent, regenerateComponent } from '../controllers/componentController';

const router = Router();

router.route('/')
  .get(getComponents)
  .post(createComponent);

router.route('/scrape')
  .post(scrapeAndSaveComponent);

// NEW: Route for individual SEO hardware pages
router.route('/:id')
  .get(getComponentById);

// Pro model regeneration endpoint
router.route('/:id/regenerate')
  .post(regenerateComponent);

export default router;
