import express from 'express';
import * as path from 'node:path';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../resources/swagger.json' with { type: 'json' };
import authMiddleware from './middleware/auth.js';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import { initializeDatabase } from './database/database.js';
import UserRepository from './repositories/userRepository.js';
import WorkoutRepository from './repositories/workoutRepository.js';
import GoalRepository from './repositories/goalRepository.js';
import { setUserRepository } from './services/userService.js';
import { setWorkoutRepositories } from './services/workoutService.js';
import { setMetricsRepositories } from './services/metricsService.js';

// Initialize database and repositories
const db = initializeDatabase();
const userRepository = new UserRepository(db);
const workoutRepository = new WorkoutRepository(db);
const goalRepository = new GoalRepository(db);

// Wire repositories into services
setUserRepository(userRepository);
setWorkoutRepositories(workoutRepository, userRepository);
setMetricsRepositories(userRepository, workoutRepository, goalRepository);

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(cors());
app.use(bodyParser.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/users', userRoutes);
app.use('/api/login', userRoutes);

app.use(authMiddleware);

app.use('/api/workouts', workoutRoutes);
app.use('/api/metrics', metricsRoutes);

app.use((err, req, res) => {
  res.status(err.status || 500).json({ error: err.message });
});

// Fallback route to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
