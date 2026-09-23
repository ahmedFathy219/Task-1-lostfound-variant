import { Router } from 'express';
import {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';

const router = Router();

// TODO: wire up the routes described in README.md section 3.
router.get('/', getAllItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;
