# Windows Setup & Run Instructions

## Prerequisites
1.  **Node.js**: Install from [nodejs.org](https://nodejs.org/).
2.  **MongoDB**:
    *   Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
    *   Ensure the MongoDB service is running (Task Manager -> Services -> MongoDB).
    *   Alternatively, you can use MongoDB Atlas (Cloud) by updating the `MONGODB_URI` in `.env`.

## Installation
1.  Open Command Prompt (cmd) or PowerShell in the project folder.
2.  Run `npm install` to install dependencies.

## Running the App
1.  **Double-click** the `start.bat` file in the project folder.
    *   This will open two new windows: one for the backend server and one for the frontend.
2.  **Or** run via command line:
    ```cmd
    npm run start:windows
    ```

## Troubleshooting
*   **MongoDB Connection Error**: Ensure MongoDB is running locally on port 27017. If using cloud, check your IP whitelist.
*   **Port In Use**: If port 5001 is taken, edit `.env` and `server/index.js` to use a different port.
