import express from 'express';
import { createUserExperiment } from '../controllers/experimentController';

const router = express.Router();
router.post('/', createUserExperiment) ; 

export default router;