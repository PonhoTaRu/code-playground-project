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
1. Install Backend dependencies
<pre> ```bash cd server npm install node server.js ``` </pre>

2. Install Frontend dependencies
cd ../code-playground
npm install

🔑 Environment Setup (Important)

Create a .env file inside the server/ folder:

JUDGE0_API_KEY=your_api_key_here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com

📌 You can get your API key from RapidAPI (Judge0)

▶️ Running the Application
1. Start Backend
cd server
node server.js
2. Start Frontend
cd code-playground
npm run dev
🌐 Access the Application

Open your browser and go to:

http://localhost:5173
🔗 Important Notes

Ensure Backend is running before using the Frontend

Frontend API URL should point to:

http://localhost:3000

If Judge0 API is not configured → Code execution will not work

🧪 Basic Testing

✅ Register a new account

✅ Login

✅ Solve a problem

✅ Click Run / Submit

✅ Check output/result

⚠️ Common Issues
Issue	Cause	Fix
❌ Run not working	No Judge0 API key	Add .env
❌ Login error	Invalid/expired token	Re-login
❌ Blank page	Missing dependencies	Run npm install
❌ CORS error	Backend config issue	Enable cors()
❌ API not responding	Backend not running	Start server
