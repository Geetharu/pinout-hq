import { Router } from 'express';
import { getComponents, getComponentById, createComponent, scrapeAndSaveComponent } from '../controllers/componentController';

const router = Router();

router.route('/')
  .get(getComponents)
  .post(createComponent);

router.route('/scrape')
  .post(scrapeAndSaveComponent);

// NEW: Route for individual SEO hardware pages
router.route('/:id')
  .get(getComponentById);

export default router;