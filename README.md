# Digital Wallet UI

This repository contains the React + Vite frontend for the Digital Wallet application.

The UI is built with TypeScript, Mantine components, React Router, and Axios. It communicates with the backend API at `http://localhost:8080/api` during local development.

## Prerequisites

- Node.js 20+ installed
- `pnpm`, `npm`, or `corepack` available
- Java backend running locally at `http://localhost:8080` for full API integration

## Install dependencies

```powershell
cd digital-wallet-ui
npm install
```

## Development

Start the Vite dev server with hot reload:

```powershell
npm run dev
```

Open the UI at `http://localhost:5173`.

## Build

Create a production-ready build:

```powershell
npm run build
```

Preview the production build locally:

```powershell
npm run preview
```

## Tests

Run unit tests with Vitest:

```powershell
npm run test
```

Run tests once for CI:

```powershell
npm run test:run
```

## Linting

Check code quality with ESLint:

```powershell
npm run lint
```

## Backend integration

The frontend expects the backend API to be available at:

- `http://localhost:8080/api`

If the backend is not running, API requests will fail and the app will not display list data.

For the backend repository, see `../digital-wallet-backend`.

## Deployment notes

- The frontend can be deployed as a static website to Azure Storage, GitHub Pages, or another static hosting service.
- Build output is generated in the `dist/` folder.
- For Azure deployment, the UI static files should be uploaded to the storage account created by the Terraform code in `../digital-wallet-iac`.

## Project structure

- `src/main.tsx` - application entry point
- `src/App.tsx` - top-level router and layout
- `src/pages/` - page components for the wallet features
- `src/services/api.ts` - Axios API client and REST endpoints
- `src/components/` - reusable UI components
- `src/types/` - shared data types and DTOs
