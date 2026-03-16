require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');
const { generateProblems } = require("./problemGenerator");
const { validateOutput } = require("./validators");
const { register, login } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/register', register);
app.post('/login', login);

const JUDGE0_ENDPOINT = process.env.JUDGE0_ENDPOINT || 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const SECRET = process.env.JWT_SECRET || 'my_secret_key';

let activeProblems = [];

/* =========================
   Ensure extra tables exist
========================= */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS play_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      problem_title TEXT NOT NULL,
      difficulty TEXT,
      status TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      source_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

// helper headers
function judge0Headers() {
  const headers = { 'Content-Type': 'application/json' };
  if (RAPIDAPI_KEY) {
    headers['x-rapidapi-key'] = RAPIDAPI_KEY;
    headers['x-rapidapi-host'] = 'judge0-ce.p.rapidapi.com';
  }
  return headers;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ message: 'ไม่ได้ส่ง token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

function getOptionalUser(req) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (!token) return null;
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function calculateScore(problem, isAccepted, usedSolution = false) {
  if (!isAccepted) return 0;

  const difficulty = problem?.difficulty || 'easy';
  let base = 10;

  if (difficulty === 'medium') base = 20;
  if (difficulty === 'hard') base = 30;

  return usedSolution ? Math.floor(base / 2) : base;
}

app.get("/api/problems", (req, res) => {
  try {
    const difficulty = req.query.difficulty || "all";
    activeProblems = generateProblems(3, difficulty);

    const safeProblems = activeProblems.map(({ tests, validator, ...rest }) => rest);

    res.json({
      difficulty,
      total: safeProblems.length,
      problems: safeProblems
    });
  } catch (error) {
    console.error("GET /api/problems error:", error);
    res.status(500).json({
      error: "Failed to generate problems",
      details: error.message
    });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  db.get(
    'SELECT id, username FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        console.error('GET /api/me error:', err);
        return res.status(500).json({ message: 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ' });
      }

      if (!user) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
      }

      res.json(user);
    }
  );
});

app.get('/api/me/history', authMiddleware, (req, res) => {
  db.all(
    `
      SELECT id, problem_title, difficulty, status, score, created_at
      FROM play_history
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 100
    `,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('GET /api/me/history error:', err);
        return res.status(500).json({ message: 'โหลดประวัติการเล่นไม่สำเร็จ' });
      }

      res.json(rows || []);
    }
  );
});

app.put('/api/me/username', authMiddleware, (req, res) => {
  const { newUsername } = req.body;

  if (!newUsername || !String(newUsername).trim()) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้ใหม่' });
  }

  const cleanUsername = String(newUsername).trim();

  db.get(
    'SELECT id FROM users WHERE username = ? AND id != ?',
    [cleanUsername, req.user.id],
    (err, existingUser) => {
      if (err) {
        console.error('CHECK username error:', err);
        return res.status(500).json({ message: 'ตรวจสอบชื่อผู้ใช้ไม่สำเร็จ' });
      }

      if (existingUser) {
        return res.status(400).json({ message: 'Username ซ้ำ' });
      }

      db.run(
        'UPDATE users SET username = ? WHERE id = ?',
        [cleanUsername, req.user.id],
        function (updateErr) {
          if (updateErr) {
            console.error('UPDATE username error:', updateErr);
            return res.status(500).json({ message: 'เปลี่ยนชื่อผู้ใช้ไม่สำเร็จ' });
          }

          const token = jwt.sign(
            { id: req.user.id, username: cleanUsername },
            SECRET,
            { expiresIn: '1h' }
          );

          res.json({
            message: 'เปลี่ยนชื่อผู้ใช้สำเร็จ',
            username: cleanUsername,
            token
          });
        }
      );
    }
  );
});

app.put('/api/me/password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่' });
  }

  if (String(newPassword).length < 4) {
    return res.status(400).json({ message: 'รหัสผ่านใหม่สั้นเกินไป' });
  }

  db.get(
    'SELECT * FROM users WHERE id = ?',
    [req.user.id],
    async (err, user) => {
      if (err) {
        console.error('GET user for password change error:', err);
        return res.status(500).json({ message: 'ตรวจสอบผู้ใช้ไม่สำเร็จ' });
      }

      if (!user) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
      }

      try {
        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) {
          return res.status(401).json({ message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        db.run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashed, req.user.id],
          function (updateErr) {
            if (updateErr) {
              console.error('UPDATE password error:', updateErr);
              return res.status(500).json({ message: 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
            }

            res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
          }
        );
      } catch (hashErr) {
        console.error('Password change error:', hashErr);
        return res.status(500).json({ message: 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
      }
    }
  );
});

function normalize(text) {
  return String(text)
    .trim()
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ');
}

app.post('/api/submit', async (req, res) => {
  try {
    const {
      problemId,
      sourceCode,
      languageId = 71,
      customInput,
      usedSolution = false
    } = req.body;

    const problem = activeProblems.find((p) => p.id === problemId);
    if (!problem) {
      return res.status(400).json({ error: 'Unknown problemId' });
    }

    const testcases = customInput
      ? [{ input: customInput, expected: null }]
      : problem.tests;

    const results = [];

    for (const test of testcases) {
      const submission = {
        language_id: languageId,
        source_code: sourceCode,
        stdin: test.input,
      };

      const url = `${JUDGE0_ENDPOINT}/submissions?base64_encoded=false&wait=true`;
      const response = await axios.post(url, submission, {
        headers: judge0Headers(),
        timeout: 30000,
      });

      const tokenData = response.data;
      const stdout = tokenData.stdout || '';
      const stderr = tokenData.stderr || '';

      const pass =
        test.expected == null
          ? true
          : validateOutput(stdout, test, problem);

      results.push({
        input: test.input,
        expected: test.expected,
        out: stdout,
        stderr: stderr ? String(stderr).trim() : null,
        pass,
        time: tokenData.time,
        memory: tokenData.memory,
      });

      if (test.expected != null && !pass) break;
    }

    const allPass = results.every((r) => r.pass);
    const status = allPass
      ? 'Accepted'
      : results.some((r) => r.stderr)
      ? 'Error'
      : 'Wrong Answer';

    const hints = [];
    if (status === 'Wrong Answer') {
      hints.push('ตรวจรูปแบบช่องว่างหรือการขึ้นบรรทัดใหม่');
      hints.push('ตรวจว่าพิมพ์ผลลัพธ์ด้วย print หรือ console.log ให้ตรงตามโจทย์');
    } else if (status === 'Error') {
      hints.push('เกิดข้อผิดพลาดขณะรันโค้ด ดู stderr เพิ่มเติม');
    }

    // optional history save when user sends Bearer token
    const authUser = getOptionalUser(req);
    const score = calculateScore(problem, status === 'Accepted', usedSolution);

    if (authUser?.id && !customInput) {
      db.run(
        `
          INSERT INTO play_history (user_id, problem_title, difficulty, status, score, source_code)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          authUser.id,
          problem.title || `Problem ${problem.id}`,
          problem.difficulty || 'easy',
          status,
          score,
          sourceCode || ''
        ],
        (dbErr) => {
          if (dbErr) {
            console.error('Save history error:', dbErr);
          }
        }
      );
    }

    res.json({ status, cases: results, hints, score });
  } catch (err) {
    console.error('Submit error:', err.response?.data || err.message);
    res.status(500).json({
      status: 'Error',
      message: 'Execution failed',
      details: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));