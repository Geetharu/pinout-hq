import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { connectRedis } from './config/redis';
import { createMcpRouter } from './mcp/server';

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/mcp', createMcpRouter());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'PinoutHQ Autonomous Engine',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const startServer = async () => {
  try {
    console.log('⏳ Booting PinoutHQ Backend Engine...');
    
    await Promise.all([
      connectDatabase(),
      connectRedis()
    ]);

    app.listen(env.PORT, () => {
      console.log(`🚀 PinoutHQ Server live on port ${env.PORT} in [${env.NODE_ENV}] mode`);
    });
  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();

export default app;