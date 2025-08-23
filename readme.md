# Autódromo Cost Dashboard (Frontend-only)

This project contains the frontend-only cost dashboard for Autódromo, which now fetches data directly from a Google Sheet.

## Getting Started (Development Mode)

To run this application in development mode with live reloading and access to Vite logs, follow these steps:

1.  **Build and run:**

    ```bash
    docker-compose up --build
    ```

## Google Sheets Integration

This dashboard retrieves its data from a Google Sheet. Ensure that the `spreadsheetId` and `keyAPI` variables in `src/App.jsx` are correctly configured to point to your Google Sheet and API key.

**Note:** The `keyAPI` is a sensitive credential and should be handled securely. For production environments, consider using environment variables or a more secure method for managing API keys.

## Running in Production

To run the application in production, you would typically build the frontend and serve the static files using a web server like Nginx. The provided `Dockerfile` currently sets up a development environment. For a production setup, you would modify the `Dockerfile` to build the application (`pnpm run build`) and then serve the `dist` folder with Nginx.