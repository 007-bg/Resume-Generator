# Frontend Setup & Run Instructions

## Prerequisites
- Node.js 18+ (LTS recommended)
- NPM (comes with Node)

## 1. Install Dependencies
Navigate to the frontend directory and install packages:
```bash
cd frontend
npm install
# OR if you use yarn/pnpm:
# yarn install
# pnpm install
```

## 2. Environment Configuration
The frontend connects to the backend API.
- Default API URL: `http://localhost:8000`
- If you need to change this, create a `.env.local` file:
```bash
VITE_API_URL=http://localhost:8000
```

## 3. Run Development Server
Start the Vite dev server with hot reload:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 4. Build for Production
To create a production build (output to `dist/`):
```bash
npm run build
```

## 5. Preview Production Build
To test the production build locally:
```bash
npm run preview
```
