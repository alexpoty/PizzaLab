# PizzaLab Frontend

React + TypeScript + Vite frontend for the PizzaLab dough calculator.

## Run locally

Start the backend from the repository root:

```bash
./gradlew :backend:bootRun
```

Start the frontend:

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

## Checks

```bash
npm run lint
npm run build
```
