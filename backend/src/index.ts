import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// CORS Configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true, // Allow cookies to be sent
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Server running at http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS enabled for: ${config.corsOrigin}`);
});