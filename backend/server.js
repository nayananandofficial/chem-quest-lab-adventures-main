import express from 'express';
import cors from 'cors';
import chemicalsRoute from './routes/chemicalsRoute.js';
import lessonsRoute from './routes/lessonsRoute.js';
import experimentRoute from './routes/experimentRoute.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/chemicals',chemicalsRoute);
app.use('/api/lessons', lessonsRoute);
app.use('/api/add-experiment', experimentRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); 
});