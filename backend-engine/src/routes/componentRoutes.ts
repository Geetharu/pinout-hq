import { Router } from 'express';
import { 
  getComponents, 
  getComponentById, 
  createComponent, 
  scrapeAndSaveComponent, 
  regenerateComponent, 
  getComponentsBatch,
  getCommentsByComponentId, 
  addCommentToComponent 
} from '../controllers/componentController';
import { triggerBulkRegeneration } from '../controllers/queueController';

const router = Router();

router.route('/')
  .get(getComponents)
  .post(createComponent);

router.route('/scrape')
  .post(scrapeAndSaveComponent);

router.route('/bulk-regenerate')
  .post(triggerBulkRegeneration);

router.route('/batch')
  .post(getComponentsBatch);

router.route('/:id')
  .get(getComponentById);

router.route('/:id/regenerate')
  .post(regenerateComponent);

router.route('/:id/comments')
  .get(getCommentsByComponentId)
  .post(addCommentToComponent);

export default router;