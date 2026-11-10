# Artisan Taguig Cashier System

## Run locally

1. Install Node.js 18+.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` (or leave it blank to preview the frontend).
4. Run `npm start`, then open `http://localhost:3000`.

The browser app is immediately usable and stores sales in `localStorage`. The included API in `server.js` is ready for MongoDB integration; connect the frontend to `/api/sales` when moving from demo/local storage to production persistence.

## Deploy to Render with MongoDB

1. Create a MongoDB Atlas cluster. Create a database user, choose **Network Access**, and allow Render’s outbound access (for a quick school demo, `0.0.0.0/0`; restrict this for production).
2. Push this folder to a GitHub repository.
3. In Render, choose **New > Web Service**, connect the repository, and set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables in Render:
   - `MONGODB_URI`: your Atlas connection string
   - `NODE_ENV`: `production`
5. Deploy. Render supplies `PORT` automatically.

For production, replace the demo “any password” login with hashed passwords and server-side sessions/JWT. Keep `TPAT2026` out of source code and move it to a secret environment variable before public deployment.

## Included behavior

- Cashier login using the provided team member list.
- Henna sales with a searchable artist list and custom price.
- Small pins (₱25), large pins (₱35), and custom pins.
- Fuzzy Wire products with fixed prices, quantities, and multiple products in one sale.
- Daily reports with Henna/Pins/overall totals, recorder, timestamp, and print-to-PDF.
- Voiding with `TPAT2026`; voided entries remain visible but excluded from totals.
- Record clearing with `TPAT2026` in the demo UI and API.
