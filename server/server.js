require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
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

let activeProblems = [];

// helper headers
function judge0Headers() {
  const headers = { 'Content-Type': 'application/json' };
  if (RAPIDAPI_KEY) {
    headers['x-rapidapi-key'] = RAPIDAPI_KEY;
    headers['x-rapidapi-host'] = 'judge0-ce.p.rapidapi.com';
  }
  return headers;
}

app.get("/api/problems", (req, res) => {
  try {
    activeProblems = generateProblems(3);

    const safeProblems = activeProblems.map((p) => ({
      id: p.id,
      title: p.title,
      prompt: p.prompt,
      hints: p.hints,
      starter: p.starter,
      samples: p.samples,
    }));

    res.json(safeProblems);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate problems', details: e.message });
  }
});

function normalize(text) {
  return String(text)
    .trim()
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ');
}

app.post('/api/submit', async (req, res) => {
  try {
    const { problemId, sourceCode, languageId = 71, customInput } = req.body;

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

    res.json({ status, cases: results, hints });
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

// Fetch problems once on startup (warmup)
fetch(`http://localhost:${PORT}/api/problems`)
  .then((res) => res.json())
  .then((data) => console.log('Warmup fetched problems:', data.length))
  .catch((err) => console.error('Warmup fetch failed:', err));
