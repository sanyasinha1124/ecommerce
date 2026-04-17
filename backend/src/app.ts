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
// app.use(helmet());

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP temporarily to see if CSS returns
}));
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'], // Allow both for easy testing
  credentials: true, // Required for cookies to be sent cross-origin
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

const projectFolderName = 'stylehub-frontend';
const angularDistRoot = path.join(__dirname, "../../frontend/dist", projectFolderName);
const angularBrowserPath = path.join(angularDistRoot, "browser");

// Determine if we should use the /browser subfolder or the root dist
const angularDistPath = path.join(__dirname, "../../frontend/dist/frontend");

console.log('Serving frontend from:', angularDistPath);
// Check if the directory exists to avoid the ENOENT error
if (!fs.existsSync(angularDistPath)) {
    console.error('❌ ERROR: Frontend build directory not found at:', angularDistPath);
    console.error('Did you run "npm run build" in the frontend folder?');
}

app.use(express.static(angularDistPath));

// Handle Angular Routing: Serve index.html for any route that doesn't start with /api
app.get(/^\/(?!api).*/, (req, res) => {
    const indexPath = path.join(angularDistPath, "index.html");
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send("Frontend index.html not found. Check your build output.");
    }
});
// Central error handler — must be registered after all routes
app.use(errorHandler);

export default app;