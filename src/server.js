require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const { pgAuthPool } = require('./config/database');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const PORT = parseInt(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    // Test database connection
    const client = await pgAuthPool.connect();
    logger.info('✅ Database connection established');
    client.release();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Doc Search API server running on port ${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await pgAuthPool.end();
        logger.info('Database pool closed');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      shutdown('uncaughtException');
    });

  } catch (err) {
    logger.error('Failed to start server:', err.message);
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
