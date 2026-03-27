🚀 Code Playground – Setup & Run Guide
🧩 Overview

This project is a full-stack web application for practicing programming with real-time code execution.

🎨 Frontend: React + Vite

⚙️ Backend: Node.js + Express

🗄️ Database: SQLite

🧪 Code Execution: Judge0 API

⚙️ Prerequisites

Make sure you have installed:

✅ Node.js (v18 or higher)

✅ npm

📁 Project Structure
code-playground-project/
│
├── code-playground/   # Frontend (React)
├── server/            # Backend (Node.js)
📦 Installation
▶️ Install Backend dependencies
cd server
npm install
▶️ Install Frontend dependencies
cd code-playground
npm install
🔑 Environment Setup (Important)

Create a .env file inside the server/ folder:

RAPIDAPI_KEY=your_api_key_here
JUDGE0_ENDPOINT=https://judge0-ce.p.rapidapi.com
JWT_SECRET=change_this_secret
CORS_ORIGIN=http://localhost:5173
ACTIVE_PROBLEM_TTL_MS=900000

📌 Get your API key from RapidAPI (Judge0)

▶️ Running the Application
▶️ Start Backend
cd server
node server.js
▶️ Start Frontend
cd code-playground
npm run dev
🌐 Access the Application
http://localhost:5173
🔗 Important Notes

Ensure Backend is running before using the Frontend

Frontend API URL should point to:

http://localhost:8080

For frontend env (optional), create `code-playground/.env`:

VITE_API_BASE_URL=http://localhost:8080

If Judge0 API is not configured → Code execution will not work

🧪 Basic Testing

✅ Register a new account

✅ Login

✅ Solve a problem

✅ Click Run / Submit

✅ Check output/result

Run smoke test:

cd server
npm run test:smoke
