import 'reflect-metadata';
import app from './app.js';
import { AppDataSource } from './config/data-source';

const PORT = process.env.PORT || 3000;

// Initialize DB connection first, then start accepting requests
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected — tables synchronized');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });