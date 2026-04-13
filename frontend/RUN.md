# StyleHub Frontend — Setup & Run Guide

## Your folder structure should look like this:
```
ecommerce/
├── backend/          ← Express + TypeORM backend
├── frontend/         ← THIS Angular standalone app
└── ProductImages/    ← Product image uploads
```

---

## STEP 1 — Install dependencies

```bash
cd ecommerce/frontend

# IMPORTANT: use plain npm install — do NOT run npm audit fix --force
# That command would upgrade Angular to v21 which breaks the v17 CLI
npm install
```

---

## STEP 2 — Run in DEVELOPMENT mode
(backend must already be running on port 3000)

```bash
# Terminal 1 — start backend
cd ecommerce/backend
npm run dev

# Terminal 2 — start frontend dev server
cd ecommerce/frontend
npm start
```

Frontend runs on: http://localhost:4200
All /api and /ProductImages requests are proxied to http://localhost:3000

---

## STEP 3 — Build for PRODUCTION (single unified server)

```bash
cd ecommerce/frontend
npm run build
```

Build output lands in: `ecommerce/frontend/dist/frontend/browser/`

Your backend `src/app.ts` already serves this via:
```typescript
const frontendDist = path.join(__dirname, '../../frontend/dist/frontend/browser');
app.use(express.static(frontendDist));
app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
```

After building, visit: http://localhost:3000

---

## Credentials (after running backend seed)
- Admin:    admin@shop.com  /  Admin1234
- Customer: Register a new account via /register

---

## IMPORTANT: Backend endpoints needed

Make sure your backend has these auth routes (added in Step 14):
- PUT  /api/auth/profile
- PUT  /api/auth/change-password

And the /me route (added in Step 10):
- GET  /api/auth/me

---

## Troubleshooting

### "Cannot find module" errors
Run `npm install` again inside the frontend folder.

### Blank page after ng build
Check the `outputPath` in angular.json matches what Express serves.
Default build output: `dist/frontend/browser/`

### CORS errors in dev
The proxy.conf.json routes /api to localhost:3000.
Make sure backend has: `origin: 'http://localhost:4200'` in CORS config.

### Cookie not sent
The HTTP interceptor adds `withCredentials: true` to all requests.
Backend must have `credentials: true` in CORS settings.

### Images not loading
Place images in `ecommerce/ProductImages/` folder.
Backend serves them at: GET /ProductImages/filename.jpg
