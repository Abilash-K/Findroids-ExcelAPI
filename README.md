# Findroids Excel API

A TypeScript API built with Express and Supabase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (for future Supabase configuration)

## Development

To run the development server:
```bash
npm run dev
```

## Production

To build and run the production server:
```bash
npm run build
npm start
```

## API Endpoints

- `GET /`: Hello World endpoint

## Logging

The application uses Winston for logging. Logs are written to:
- `error.log`: Error-level logs
- `combined.log`: All logs
- Console: Development logs with colors 