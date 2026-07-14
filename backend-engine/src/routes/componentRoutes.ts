import { Router } from 'express';
import { getComponents, createComponent, scrapeAndSaveComponent } from '../controllers/componentController';

const router = Router();

// Standard CRUD endpoints
router.route('/')
  .get(getComponents)
  .post(createComponent);

// Autonomous automation endpoint for web scraping
router.route('/scrape')
  .post(scrapeAndSaveComponent);

export default router;