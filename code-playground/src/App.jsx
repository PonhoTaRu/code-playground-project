// src/App.jsx
import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
//import starterSolutions from './starterSolutions';

const starterSolutions = {
  'sum-two': `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
let input = []; rl.on('line', l => input.push(l)); rl.on('close', () => {
  const [a,b] = input.join(' ').split(/\\s+/).map(Number);
  console.log(a+b);
});`,
  'repeat-word': `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
let lines = []; rl.on('line', l => lines.push(l)); rl.on('close', () => {
  const [w, n] = lines.join(' ').split(/\\s+/);
  console.log(Array(Number(n)).fill(w).join(' '));
});`,
  'even-odd': `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
let s = ''; rl.on('line', l => s += l); rl.on('close', () => {
  const n = Number(s.trim());
  console.log(n % 2 === 0 ? 'Even' : 'Odd');
});`,
  'hello-name': `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
let s = ''; rl.on('line', l => s += l); rl.on('close', () => {
  console.log('Hello ' + s.trim());
});`,
  'reverse-text': `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
let s = ''; rl.on('line', l => s += l); rl.on('close', () => {
  console.log(s.split('').reverse().join(''));
});`
};

export default function App() {
  const [problems, setProblems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [xp, setXp] = useState(() => Number(localStorage.getItem('xp') || 0));
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('streak') || 0));
  const [customInput, setCustomInput] = useState('');
  const total = 3;

  // โหลดโจทย์สุ่ม 3 ข้อจาก backend
  async function loadProblems() {
  const res = await fetch('/problems.json'); // โหลดจาก public/
  const data = await res.json();
  // สุ่มโจทย์เหมือนเดิม
  const selected = data.sort(() => Math.random() - 0.5).slice(0, 3);
  setProblems(selected);
  setCode(starterSolutions[selected[0]?.id] || '');
}


  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    const p = problems[idx];
    if (p) setCode(starterSolutions[p.id] || '');
  }, [idx, problems]);

  useEffect(() => {
    localStorage.setItem('xp', xp);
    localStorage.setItem('streak', streak);
  }, [xp, streak]);

  const currentProblem = useMemo(() => problems[idx], [problems, idx]);

  // ฟังก์ชันส่งโค้ดไป backend
  async function run(useCustom = false) {
    if (!currentProblem) return;
    setRunning(true);
    setResult(null);
    try {
      const body = {
        problemId: currentProblem.id,
        sourceCode: code,
        languageId: 63
      };
      if (useCustom && customInput.trim()) body.customInput = customInput;

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      setResult(data);

      if (data.status === 'Accepted') {
        setXp(xp + 10);
        setStreak(streak + 1);
        // สั้น ๆ ให้เห็นผล แล้วไปข้อถัดไป
        setTimeout(() => {
          if (idx + 1 < total) {
            setIdx(idx + 1);
            setResult(null);
          } else {
            loadProblems();
          }
        }, 800);
      } else if (data.status === 'Wrong Answer') {
        setStreak(0);
      }
    } catch (e) {
      setResult({ status: 'Error', message: e.message });
    } finally {
      setRunning(false);
    }
  }

  async function reshuffle() {
    await loadProblems();
  }

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#0f0f10', color: '#eaeaea', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ height: 60, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e1e22', background: '#0b0b0c' }}>
        <div style={{ fontWeight: 800 }}>Code Playground</div>
        <div style={{ fontSize: 14 }}>XP: <b style={{ color: '#7dd3fc' }}>{xp}</b> &nbsp; Streak: <b style={{ color: '#a7f3d0' }}>{streak}</b></div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', gap: 0, background: '#1e1e20' }}>
        {/* Left column */}
        <section style={{ background: '#161616', padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <div style={{ opacity: .9, marginBottom: 8 }}>ข้อที่ {idx + 1} / {total}</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{currentProblem?.title}</div>

            {/* Prompt: ใช้ ReactMarkdown + pre-wrap เพื่อจัดบรรทัด */}
            <div style={{ marginBottom: 12 }}>
              {currentProblem ? (
                <div style={{ background: '#0b0b0c', padding: 12, borderRadius: 8, border: '1px solid #222' }}>
                  <ReactMarkdown
                    children={currentProblem.prompt || ''}
                    components={{
                      // ให้ <p> เคารพการขึ้นบรรทัด
                      p: ({ node, ...props }) => <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }} {...props} />
                    }}
                  />
                </div>
              ) : (
                <div>กำลังโหลดโจทย์...</div>
              )}
            </div>

            {/* Sample */}
            {currentProblem?.samples?.[0] && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>ตัวอย่าง</div>
                <pre style={{ background: '#0b0b0c', padding: 8, borderRadius: 8, border: '1px solid #222', fontSize: 13, whiteSpace: 'pre-wrap' }}>
{`Input:
${currentProblem.samples[0].in}

Output:
${currentProblem.samples[0].out}`}
                </pre>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => run(false)} disabled={running} style={{ flex: 1, padding: 10, borderRadius: 8, background: '#eaeaea', color: '#111', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer' }}>
              {running ? 'Running…' : 'Run'}
            </button>
            <button onClick={() => run(true)} disabled={running} style={{ flex: 1, padding: 10, borderRadius: 8, background: '#2b2b2b', color: '#eaeaea', border: '1px solid #333', cursor: running ? 'not-allowed' : 'pointer' }}>
              Run (with input)
            </button>
          </div>

          {/* Custom input textarea + result */}
          <div style={{ display: 'grid', gap: 8 }}>
            <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="(ใส่ input เพื่อทดสอบเอง — ใช้ปุ่ม Run (with input))" style={{ height: 80, resize: 'none', padding: 8, borderRadius: 8, background: '#0b0b0c', color: '#eaeaea', border: '1px solid #222' }} />

            <div style={{ background: '#0b0b0c', padding: 10, borderRadius: 8, border: '1px solid #222', height: 160, overflow: 'auto' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>ผลการทดสอบ</div>
              {!result && <div style={{ opacity: .7 }}>กด Run เพื่อประมวลผล</div>}
              {result && (
                <div style={{ fontSize: 13 }}>
                  <div>สถานะ: <b style={{ color: result.status === 'Accepted' ? '#34d399' : result.status === 'Wrong Answer' ? '#fb7185' : '#f59e0b' }}>{result.status}</b></div>

                  {result.cases?.map((c, i) => (
                    <details key={i} style={{ marginTop: 8, background: '#0b0b0c', padding: 8, borderRadius: 6 }}>
                      <summary>เคส {i + 1}: {c.pass ? 'ผ่าน' : 'ไม่ผ่าน'}</summary>
                      <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{`Input:
${c.input}

Expected:
${c.expected}

Your Output:
${c.out}

stderr:
${c.stderr || ''}`}</pre>
                    </details>
                  ))}

                  {result.hints?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 700 }}>คำแนะนำ</div>
                      <ul style={{ marginLeft: 16 }}>
                        {result.hints.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={reshuffle} style={{ flex: 1, padding: 8, borderRadius: 8, background: 'transparent', color: '#eaeaea', border: '1px solid #333' }}>สุ่มชุดใหม่</button>
              <div style={{ width: 10 }} />
            </div>
          </div>
        </section>

        {/* Right column - Editor */}
        <section style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: 10, borderBottom: '1px solid #1a1a1c', background: '#0b0b0c' }}>JavaScript (Node.js)</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
