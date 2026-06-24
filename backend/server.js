import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

// Init environment configurations
dotenv.config();

// Establish core DB runtime attachments
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Technical backend container active on port: ${PORT}`);
});

// Resilient handling of unexpected unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Critical Server Error]: ${err.message}`);
  server.close(() => process.exit(1));
});