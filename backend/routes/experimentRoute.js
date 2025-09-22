import express from 'express';
import { createUserExperiment } from '../controllers/experimentController.js';


const router = express.Router();
router.post('/', createUserExperiment) ; 

export default router;