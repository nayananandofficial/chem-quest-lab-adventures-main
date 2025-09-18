import express from 'express';
import { getChemicals } from '../controllers/chemicalsController.js';

const router = express.Router();

router.get('/', getChemicals);

export default router;