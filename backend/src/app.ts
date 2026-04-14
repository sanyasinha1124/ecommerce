import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';
import fs from 'fs';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:4200', // Angular dev server
  credentials: true,               // Required for cookies to be sent cross-origin
}));

app.use(express.json());
app.use(cookieParser());

// Static file serving
app.use('/ProductImages', express.static(path.join(__dirname, '../../ProductImages')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// SPA fallback — must be last; serves Angular's index.html for all non-API routes
// const frontendDist = path.join(__dirname, '../../frontend/dist/frontend/browser');
// app.use(express.static(frontendDist));
// app.get('/api', (req, res) => {
//   res.sendFile(path.join(frontendDist, 'index.html'));
// });
const angularDistRoot = path.join(__dirname, "../../frontend/dist/frontend");
const angularBrowserPath = path.join(angularDistRoot, "browser");

// Determine if we should use the /browser subfolder or the root dist
const angularDistPath = fs.existsSync(angularBrowserPath)
  ? angularBrowserPath
  : angularDistRoot;

console.log('Serving frontend from:', angularDistPath);

app.use(express.static(angularDistPath));

// Handle Angular Routing: Serve index.html for any route that doesn't start with /api
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(angularDistPath, "index.html"));
});

// Central error handler — must be registered after all routes
app.use(errorHandler);

export default app;