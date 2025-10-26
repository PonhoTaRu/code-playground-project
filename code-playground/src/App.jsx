// src/App.jsx
import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import starterSolutions from "./starterSolutions";

// templates (เหมือนเดิม)
const defaultTemplates = {
  inputTemplate: `// อ่าน input จาก stdin (Node.js)
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);

// TODO: แก้โค้ดตามโจทย์
if (input.length >= 2) {
  const a = Number(input[0]);
  const b = Number(input[1]);
  console.log(a + b);
}`,
  simpleTemplate: `// ไม่มี input — เขียนคำตอบโดยใช้ console.log()
// ตัวอย่าง:
const a = 5;
const b = 7;
console.log(a + " + " + b + " = " + (a + b));`,
};

function detectNeedsInput(promptText = "") {
  if (!promptText) return false;
  const lower = promptText.toLowerCase();
  return /\bรับ\b|\binput\b|\bรับตัว\b|\binput:/i.test(lower);
}

function getStarterForProblem(problem, starterSolutions = {}) {
  if (!problem) return defaultTemplates.simpleTemplate;
  if (starterSolutions[problem.id]) return starterSolutions[problem.id];
  const needsInput = detectNeedsInput(problem.prompt || "");
  return needsInput
    ? defaultTemplates.inputTemplate
    : defaultTemplates.simpleTemplate;
}

export default function App() {
  const [problems, setProblems] = useState([]);
  const [idx, setIdx] = useState(0);
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [xp, setXp] = useState(() => Number(localStorage.getItem("xp") || 0));
  const [streak, setStreak] = useState(
    () => Number(localStorage.getItem("streak") || 0)
  );
  const [customInput, setCustomInput] = useState("");
  const [revealedHints, setRevealedHints] = useState([]); // เก็บ index ของ hints ที่เปิดแล้วสำหรับโจทย์ปัจจุบัน
  const total = 3;

  // โหลดโจทย์และ reset revealedHints
  async function loadProblems() {
    try {
      setResult(null);
      setIdx(0);
      const res = await fetch("/problems.json");
      const data = await res.json();
      const selected = data.sort(() => Math.random() - 0.5).slice(0, total);
      setProblems(selected);
      setCode(getStarterForProblem(selected[0], starterSolutions));
      setRevealedHints([]); // รีเซ็ตคำใบ้สำหรับชุดใหม่
    } catch (e) {
      console.error("Load problems error", e);
    }
  }

  useEffect(() => {
    loadProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const p = problems[idx];
    if (p) {
      setCode(getStarterForProblem(p, starterSolutions));
      setRevealedHints([]); // เปลี่ยนโจทย์ใหม่ รีเซ็ตคำใบ้
    }
  }, [idx, problems]);

  useEffect(() => {
    localStorage.setItem("xp", xp);
    localStorage.setItem("streak", streak);
  }, [xp, streak]);

  const currentProblem = useMemo(() => problems[idx], [problems, idx]);

  // เปิดคำใบ้ถัดไป (reveal one more)
  function revealNextHint() {
    if (!currentProblem || !Array.isArray(currentProblem.hints)) return;
    const count = currentProblem.hints.length;
    const nextIndex = revealedHints.length; // เปิด hint ถัดไปคือ index = current revealed length
    if (nextIndex >= count) return; // ไม่มีใบ้อีก
    setRevealedHints(prev => [...prev, nextIndex]);
    // (option) ลด XP เล็กน้อยเมื่อขอใบ้: uncomment ถ้าต้องการ
    // setXp(prev => Math.max(0, prev - 2));
  }

  // รันโค้ดกับ backend (เหมือนเดิม)
  async function run(useCustom = false) {
    console.log('run() called', { useCustom, currentProblemId: currentProblem?.id });
    if (!currentProblem) {
      console.warn('no currentProblem, abort run');
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const body = {
        problemId: currentProblem.id,
        sourceCode: code,
        languageId: 71 // หรือ 63 ขึ้นกับภาษาที่ตั้งไว้ (71 = Python3)
      };
      if (useCustom && customInput.trim()) body.customInput = customInput;
      // -- DEBUG: ใช้ absolute URL ถ้า proxy มีปัญหา --
      const submitUrl = 'http://localhost:8080/api/submit'; // <-- ถ้าจะทดสอบ local ให้เปลี่ยนเป็น /api/submit-local ตามคำแนะนำด้านล่าง
      console.log('Sending POST to', submitUrl, 'body:', body);
      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // เพิ่ม timeout-like behavior (fetch ไม่มี timeout ในเบื้องต้น)
      });
      console.log('fetch returned status', res.status);
      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error('failed parsing JSON from response', e);
        const text = await res.text().catch(()=>'<no-text>');
        console.log('response text:', text);
        throw new Error('Invalid JSON response from server');
      }
      console.log('submit response data', data);
      setResult(data);

      if (data.status === "Accepted") {
        setXp((prev) => prev + 10);
        setStreak((prev) => prev + 1);
        setTimeout(() => {
          if (idx + 1 < total) {
            setIdx((prev) => prev + 1);
            setResult(null);
          } else {
            setResult({ status: "Completed", message: "คุณทำครบทุกข้อแล้ว!" });
          }
        }, 800);
      } else if (data.status === "Wrong Answer") {
        setStreak(0);
      }
    } catch (e) {
      console.error('run() caught error', e);
      setResult({ status: 'Error', message: e.message || String(e) });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#0f0f10",
        color: "#eaeaea",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: 60,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1e1e22",
          background: "#0b0b0c",
        }}
      >
        <div style={{ fontWeight: 800 }}>Code Playground</div>
        <div style={{ fontSize: 14 }}>
          XP: <b style={{ color: "#7dd3fc" }}>{xp}</b> &nbsp; Streak:{" "}
          <b style={{ color: "#a7f3d0" }}>{streak}</b>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: 0,
          background: "#1e1e20",
        }}
      >
        {/* Left column */}
        <section
          style={{
            background: "#161616",
            padding: 16,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ opacity: 0.9, marginBottom: 8 }}>
              ข้อที่ {idx + 1} / {total}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              {currentProblem?.title}
            </div>

            {/* Prompt */}
            <div style={{ marginBottom: 12 }}>
              {currentProblem ? (
                <div
                  style={{
                    background: "#0b0b0c",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #222",
                  }}
                >
                  <ReactMarkdown
                    children={currentProblem.prompt || ""}
                    components={{
                      p: ({ ...props }) => (
                        <p
                          style={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                          {...props}
                        />
                      ),
                    }}
                  />
                </div>
              ) : (
                <div>กำลังโหลดโจทย์...</div>
              )}
            </div>

            {/* Hints UI */}
            {currentProblem?.hints && Array.isArray(currentProblem.hints) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>คำใบ้</div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>
                    {revealedHints.length}/{currentProblem.hints.length}
                  </div>
                </div>

                {/* ปุ่มขอใบ้ */}
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={revealNextHint}
                    disabled={revealedHints.length >= (currentProblem.hints?.length || 0)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: revealedHints.length >= (currentProblem.hints?.length || 0) ? "#2b2b2b" : "#fbbf24",
                      color: revealedHints.length >= (currentProblem.hints?.length || 0) ? "#9ca3af" : "#111",
                      border: "none",
                      cursor: revealedHints.length >= (currentProblem.hints?.length || 0) ? "not-allowed" : "pointer",
                      fontWeight: 700,
                    }}
                  >
                    ขอใบ้
                  </button>

                  {/* ปุ่มซ่อนคำใบ้ทั้งหมด (reset) */}
                  <button
                    onClick={() => setRevealedHints([])}
                    disabled={revealedHints.length === 0}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#2b2b2b",
                      color: "#eaeaea",
                      border: "1px solid #333",
                      cursor: revealedHints.length === 0 ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ซ่อนคำใบ้
                  </button>
                </div>

                {/* แสดงคำใบ้ที่เปิดแล้ว */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {revealedHints.map((hintIndex) => (
                    <div key={hintIndex} style={{ background: "#0b0b0c", padding: 10, borderRadius: 8, border: "1px solid #222", fontSize: 13 }}>
                      {currentProblem.hints[hintIndex]}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => run(false)}
              disabled={running}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                background: "#eaeaea",
                color: "#111",
                fontWeight: 700,
                cursor: running ? "not-allowed" : "pointer",
              }}
            >
              {running ? "Running…" : "Run"}
            </button>
            <button
              onClick={() => run(true)}
              disabled={running}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                background: "#2b2b2b",
                color: "#eaeaea",
                border: "1px solid #333",
                cursor: running ? "not-allowed" : "pointer",
              }}
            >
              Run (with input)
            </button>
          </div>

          {/* Input + Result */}
          <div style={{ display: "grid", gap: 8 }}>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="(ใส่ input เพื่อทดสอบเอง — ใช้ปุ่ม Run (with input))"
              style={{
                height: 80,
                resize: "none",
                padding: 8,
                borderRadius: 8,
                background: "#0b0b0c",
                color: "#eaeaea",
                border: "1px solid #222",
              }}
            />

            <div
              style={{
                background: "#0b0b0c",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #222",
                height: 160,
                overflow: "auto",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>ผลการทดสอบ</div>
              {!result && <div style={{ opacity: 0.7 }}>กด Run เพื่อประมวลผล</div>}
              {result && (
                <div style={{ fontSize: 13 }}>
                  <div>
                    สถานะ:{" "}
                    <b
                      style={{
                        color:
                          result.status === "Accepted"
                            ? "#34d399"
                            : result.status === "Wrong Answer"
                            ? "#fb7185"
                            : "#f59e0b",
                      }}
                    >
                      {result.status}
                    </b>
                  </div>

                  {result.cases?.map((c, i) => (
                    <details key={i} style={{ marginTop: 8, background: "#0b0b0c", padding: 8, borderRadius: 6 }}>
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
                      <div style={{ fontWeight: 700 }}>คำแนะนำจากระบบ</div>
                      <ul style={{ marginLeft: 16 }}>
                        {result.hints.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right column - Editor */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div
            style={{
              padding: 10,
              borderBottom: "1px solid #1a1a1c",
              background: "#0b0b0c",
            }}
          >
            Python 3
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(v) => setCode(v)}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
