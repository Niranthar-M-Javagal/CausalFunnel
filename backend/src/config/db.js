import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const dbUri =
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/causalfunnel_analytics';

    console.log('[Database] Connecting to MongoDB...');
    const conn = await mongoose.connect(dbUri);

    console.log(
      `[Database] MongoDB connected successfully: ${conn.connection.host}`
    );
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};