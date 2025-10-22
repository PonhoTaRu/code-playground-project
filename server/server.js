require('dotenv').config();
console.log('RAPIDAPI_KEY =', process.env.RAPIDAPI_KEY);

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config?.(); // optional if you have .env and dotenv installed

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const JUDGE0_ENDPOINT = process.env.JUDGE0_ENDPOINT || 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ''; // ใส่ RapidAPI key ใน .env ถ้ามี

// โหลดโจทย์
const problems = require('./seed-problems.json');

// helper headers
function judge0Headers() {
  const headers = { 'Content-Type': 'application/json' };
  if (RAPIDAPI_KEY) {
    headers['x-rapidapi-key'] = RAPIDAPI_KEY;
    headers['x-rapidapi-host'] = 'judge0-ce.p.rapidapi.com';
  }
  return headers;
}

// ส่งโจทย์สุ่ม 3 ข้อ (ซ่อน tests)
app.get('/api/problems', (req, res) => {
  try {
    const shuffled = [...problems].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    res.json(selected.map(({ tests, ...rest }) => rest));
  } catch (e) {
    res.status(500).json({ error: 'Failed to load problems', details: e.message });
  }
});

// รับการ submit จาก frontend
// รับ body: { problemId, sourceCode, languageId=63, customInput? }
app.post('/api/submit', async (req, res) => {
  try {
    const { problemId, sourceCode, languageId = 63, customInput } = req.body;
    const prob = problems.find(p => p.id === problemId);
    if (!prob) return res.status(400).json({ error: 'Unknown problemId' });

    // ใช้ customInput ถ้ามี (สำหรับ debug), ถ้าไม่ใช้ tests ใน prob
    const testcases = customInput ? [{ in: customInput, out: null }] : prob.tests;

    const results = [];
    for (const t of testcases) {
      // Build submission payload for Judge0
      const submission = {
        language_id: languageId,
        source_code: sourceCode,
        stdin: t.in
      };

      // call Judge0 (wait=true to get result)
      const url = `${JUDGE0_ENDPOINT}/submissions?base64_encoded=false&wait=true`;
      const response = await axios.post(url, submission, { headers: judge0Headers(), timeout: 30000 });
      const tokenData = response.data;

      const stdout = (tokenData.stdout || '').replace(/\r/g, '').trim();
      const stderr = tokenData.stderr || tokenData.compile_output || '';
      const expected = (t.out || '').replace(/\r/g, '').trim();
      const pass = (t.out == null) ? true : (stdout === expected);

      results.push({
        input: t.in,
        expected,
        out: stdout,
        stderr: stderr ? String(stderr).trim() : null,
        pass,
        time: tokenData.time,
        memory: tokenData.memory
      });

      // ถ้ามี expected และล้มเหลว ให้หยุดที่เคสแรก (เพื่อ feedback เร็ว)
      if (t.out != null && !pass) break;
    }

    const allPass = results.every(r => r.pass);
    const status = allPass ? 'Accepted' : (results.some(r => r.stderr) ? 'Error' : 'Wrong Answer');

    const hints = [];
    if (status === 'Wrong Answer') {
      hints.push('ตรวจรูปแบบช่องว่างหรือการขึ้นบรรทัดใหม่ (trim และ exact match สำคัญ)');
      hints.push('ตรวจว่าพิมพ์ผลลัพธ์ด้วย console.log แล้วหรือยัง');
    } else if (status === 'Error') {
      hints.push('เกิดข้อผิดพลาดขณะรันโค้ด ดู stderr เพื่อหาเหตุผล');
    }

    res.json({ status, cases: results, hints });
  } catch (err) {
    console.error('Submit error:', err.response?.data || err.message);
    res.status(500).json({ status: 'Error', message: 'Execution failed', details: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
