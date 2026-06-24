import express from 'express';
import cors from 'cors';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Standard middleware stack configurations
app.use(cors());
app.use(express.json());

// Application Routing entrypoint namespaces
app.use('/api', analyticsRoutes);

// Catch-all health-check interface fallback
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

export default app;