# Habit Tracker - Frontend

This is the frontend of the Habit Tracker application, built with React, Vite, and Zustand.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (22.13 or higher, within Node 22)
- [npm](https://www.npmjs.com/)

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` in the `client` directory for local development:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

For Vercel, set the project root directory to `client`, use the Vite framework preset, build command `npm run build`, and output directory `dist`. `.env.production` points to the Render API. Set `VITE_API_URL` to `https://habbitracker-backend-be0e.onrender.com/api` in Vercel for Production and Preview if previews should use the same backend, then redeploy.

The API client retries safe GET requests during Render wake-up failures and retries writes only when they carry an `Idempotency-Key`. Retry count, backoff, timeout, and API URL can be configured through the `VITE_API_*` environment variables.

### Running the Application

To start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the application for production:
```bash
npm run build
```
