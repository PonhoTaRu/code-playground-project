import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";

const fallbackStarter = "";

function getDifficultyLabel(diff) {
  if (diff === "easy") return "ง่าย";
  if (diff === "medium") return "ปานกลาง";
  if (diff === "hard") return "ยาก";
  return diff || "ทั่วไป";
}

function App() {
  const [difficulty, setDifficulty] = useState("all");
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState(fallbackStarter);
  const [status, setStatus] = useState("idle");
  const [output, setOutput] = useState("ยังไม่มีผลลัพธ์");
  const [errorMessage, setErrorMessage] = useState("");
  const [score, setScore] = useState(0);
  const [solvedIds, setSolvedIds] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");

  // hint / solution system
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHintCount, setShowHintCount] = useState(0);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [usedSolution, setUsedSolution] = useState(false);

  const currentProblem = useMemo(
    () => problems[currentIndex] || null,
    [problems, currentIndex]
  );

  const total = problems.length;
  const progressPercent = total ? ((currentIndex + 1) / total) * 100 : 0;
  const solvedCountInRound = problems.filter((p) => solvedIds.includes(p.id)).length;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      setUsername(savedUsername || "");
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadProblems(difficulty);
  }, [difficulty, isLoggedIn]);

  useEffect(() => {
    if (!currentProblem) return;

    setCode("");
    setStatus("idle");
    setOutput("ยังไม่มีผลลัพธ์");
    setErrorMessage("");

    setTimeLeft(currentProblem.revealDelaySec || 30);
    setShowHintCount(0);
    setShowRevealButton(false);
    setShowSolution(false);
    setUsedSolution(false);
  }, [currentProblem]);

  useEffect(() => {
    if (!currentProblem) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowRevealButton(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentProblem]);

  useEffect(() => {
    if (!currentProblem) return;

    const total = currentProblem.revealDelaySec || 30;
    const elapsed = total - timeLeft;
    const hintLevel = Math.floor(elapsed / 10);

    setShowHintCount(Math.max(0, hintLevel));
  }, [timeLeft, currentProblem]);

  async function loadProblems(level = "all") {
    try {
      setErrorMessage("");
      setStatus("idle");
      setOutput("กำลังโหลดโจทย์...");
      setProblems([]);
      setCurrentIndex(0);
      setSolvedIds([]);

      const res = await fetch(`http://localhost:8080/api/problems?difficulty=${level}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`โหลดโจทย์ไม่สำเร็จ (${res.status}): ${text}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.problems || [];

      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("ไม่พบรายการโจทย์จาก backend");
      }

      setProblems(list);
      setCurrentIndex(0);
      setOutput("ยังไม่มีผลลัพธ์");
    } catch (error) {
      console.error("loadProblems error:", error);
      setProblems([]);
      setErrorMessage(error.message || "โหลดโจทย์ไม่สำเร็จ");
      setStatus("error");
      setOutput("โหลดโจทย์ไม่สำเร็จ");
    }
  }

  function handleRestart() {
    loadProblems(difficulty);
  }

  function handleResetCode() {
    if (!currentProblem) return;
    setCode(currentProblem.starter || fallbackStarter);
    setStatus("idle");
    setOutput("รีเซ็ตโค้ดแล้ว");
    setErrorMessage("");
  }

  async function handleRun() {
    if (!currentProblem) return;

    try {
      setLoadingSubmit(true);
      setStatus("running");
      setErrorMessage("");

      const res = await fetch("http://localhost:8080/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          problemId: currentProblem.id,
          sourceCode: code,
          languageId: 63,
          customInput: currentProblem.samples?.[0]?.input || ""
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Run ไม่สำเร็จ");
      }

      const firstCase = data.cases?.[0];
      setStatus(data.status === "Error" ? "error" : "success");
      setOutput(firstCase?.out || firstCase?.stderr || "รันเสร็จแล้ว");
      setErrorMessage(firstCase?.stderr || "");
    } catch (error) {
      console.error("handleRun error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Run ไม่สำเร็จ");
      setOutput("เกิดข้อผิดพลาดระหว่างรัน");
    } finally {
      setLoadingSubmit(false);
    }
  }

  async function handleSubmit() {
    if (!currentProblem) return;

    try {
      setLoadingSubmit(true);
      setStatus("running");
      setErrorMessage("");

      const res = await fetch("http://localhost:8080/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          problemId: currentProblem.id,
          sourceCode: code,
          languageId: 63
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Submit ไม่สำเร็จ");
      }

      const accepted = data.status === "Accepted";
      const alreadySolved = solvedIds.includes(currentProblem.id);

      if (accepted) {
        setStatus("success");
        setErrorMessage("");

        const rendered = (data.cases || [])
          .map(
            (c, i) =>
              `Test #${i + 1}
Input: ${c.input}
Expected: ${c.expected}
Actual: ${c.out}
Status: ${c.pass ? "Passed" : "Failed"}`
          )
          .join("\n\n");

        setOutput(`✅ Accepted\n\n${rendered}`);

        if (!alreadySolved) {
          let earned = currentProblem.score || 0;
          if (usedSolution) earned = Math.floor(earned / 2);

          setSolvedIds((prev) => [...prev, currentProblem.id]);
          setScore((prev) => prev + earned);

          if (usedSolution) {
            setOutput(
              `✅ Accepted\n\nได้คะแนน ${earned} (ลดครึ่งหนึ่งเพราะใช้เฉลย)\n\n${rendered}`
            );
          }
        }
      } else {
        setStatus(data.status === "Error" ? "error" : "wrong");

        const rendered = (data.cases || [])
          .map(
            (c, i) =>
              `Test #${i + 1}
Input: ${c.input}
Expected: ${c.expected}
Actual: ${c.out}
Status: ${c.pass ? "Passed" : "Failed"}${c.stderr ? `\nstderr: ${c.stderr}` : ""}`
          )
          .join("\n\n");

        setOutput(rendered || "คำตอบยังไม่ถูกต้อง");
        setErrorMessage((data.hints || []).join("\n") || "");
      }
    } catch (error) {
      console.error("handleSubmit error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Submit ไม่สำเร็จ");
      setOutput("เกิดข้อผิดพลาดระหว่างส่งตรวจ");
    } finally {
      setLoadingSubmit(false);
    }
  }

  function handleNextProblem() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      setStatus("idle");
      setOutput("จบรอบแล้ว กด 'เริ่มรอบใหม่' เพื่อสุ่มโจทย์ชุดใหม่");
      setErrorMessage("");
      return;
    }
    setCurrentIndex(nextIndex);
  }

  function handleLoginSuccess(name) {
    setIsLoggedIn(true);
    setUsername(name || localStorage.getItem("username") || "");
  }

  function handleRegisterSuccess() {
    setAuthMode("login");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
    setAuthMode("login");
  }

  if (!isLoggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-wrapper">
          <div className="auth-brand">
            <h1>Code Playground</h1>
            <p>ฝึกเขียนโค้ดแบบสนุก พร้อมระบบบัญชีผู้ใช้</p>
          </div>

          <div className="auth-switch">
            <button
              className={`auth-tab ${authMode === "login" ? "active" : ""}`}
              onClick={() => setAuthMode("login")}
            >
              เข้าสู่ระบบ
            </button>
            <button
              className={`auth-tab ${authMode === "register" ? "active" : ""}`}
              onClick={() => setAuthMode("register")}
            >
              สมัครสมาชิก
            </button>
          </div>

          {authMode === "login" ? (
            <Login onLogin={handleLoginSuccess} />
          ) : (
            <Register onRegisterSuccess={handleRegisterSuccess} />
          )}
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="app-shell empty-state">
        <h1>Code Playground</h1>
        <p>{errorMessage || "กำลังโหลดโจทย์..."}</p>
        <button className="ghost-btn" onClick={handleRestart}>
          ลองโหลดใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <h1>Code Playground</h1>
          <p className="topbar-subtitle">
            ฝึกเขียนโค้ดแบบเห็นผลลัพธ์และความคืบหน้าชัดเจน
          </p>
        </div>

        <div className="topbar-right">
          <div className="stat-card">
            <span className="stat-label">User</span>
            <strong>{username || "ผู้ใช้"}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Level</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="stat-card">
            <span className="stat-label">Score</span>
            <strong>{score}</strong>
          </div>

          <div className="stat-card">
            <span className="stat-label">Solved</span>
            <strong>
              {solvedCountInRound}/{total}
            </strong>
          </div>

          <button className="ghost-btn" onClick={handleRestart}>
            เริ่มรอบใหม่
          </button>

          <button className="ghost-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="progress-section">
        <div className="progress-text">
          <span>
            ข้อที่ {currentIndex + 1} / {total}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <main className="workspace">
        <aside className="panel problem-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Problem</div>
              <h2>{currentProblem.title}</h2>
            </div>

            <div className={`difficulty-badge ${currentProblem.difficulty}`}>
              {getDifficultyLabel(currentProblem.difficulty)}
            </div>
          </div>

          <div className="meta-row">
            <span>คะแนนข้อนี้: {currentProblem.score || 0}</span>
            <span>Level: {currentProblem.difficulty}</span>
          </div>

          <div className="card-block">
            <p style={{ whiteSpace: "pre-wrap" }}>{currentProblem.prompt}</p>
          </div>

          <div className="section-block">
            <h3>คำใบ้</h3>
            <ul>
              {(currentProblem.hints || [])
                .slice(0, showHintCount)
                .map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
            </ul>

            <div style={{ marginTop: 10 }}>
              ⏳ เหลือเวลา: {timeLeft}s
            </div>

            <div className="timer-bar" style={{ marginTop: 8 }}>
              <div
                className="timer-fill"
                style={{
                  width: `${(timeLeft / (currentProblem.revealDelaySec || 30)) * 100}%`,
                }}
              />
            </div>

            {showRevealButton && !showSolution && (
              <button
                className="toolbar-btn secondary"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setShowSolution(true);
                  setUsedSolution(true);
                }}
              >
                ดูเฉลยตัวอย่าง
              </button>
            )}
          </div>

          <div className="section-block">
            <h3>ตัวอย่าง</h3>
            {(currentProblem.samples || []).map((sample, index) => (
              <div className="example-box" key={index}>
                <div>
                  <strong>Input</strong>
                  <pre>{sample.input}</pre>
                </div>
                <div>
                  <strong>Output</strong>
                  <pre>{sample.output}</pre>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="panel editor-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Editor</div>
              <h2>JavaScript</h2>
            </div>

            <div className="toolbar">
              <button
                className="toolbar-btn secondary"
                onClick={handleRun}
                disabled={loadingSubmit}
              >
                Run
              </button>
              <button
                className="toolbar-btn primary"
                onClick={handleSubmit}
                disabled={loadingSubmit}
              >
                Submit
              </button>
              <button
                className="toolbar-btn secondary"
                onClick={handleResetCode}
                disabled={loadingSubmit}
              >
                Reset
              </button>

              <button
                className="toolbar-btn secondary"
                onClick={() => setCode(currentProblem?.starter || fallbackStarter)}
                disabled={loadingSubmit}
              >
                โหลด starter code
              </button>
            </div>
          </div>

          <div className="editor-frame">
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>

          {showSolution && (
  <div style={{ marginTop: 20 }}>
    <h3>เฉลยตัวอย่าง</h3>

    <p style={{ color: "#94a3b8", marginBottom: 8 }}>
      นี่เป็นเพียงตัวอย่างหนึ่งวิธี คำตอบของคุณสามารถต่างจากนี้ได้ ถ้าผ่าน test
    </p>

    <pre
      style={{
        background: "#f8fafc",
        color: "#475569",
        padding: 16,
        borderRadius: 10,
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        border: "1px dashed #94a3b8",
        lineHeight: 1.5,
        fontSize: 14
      }}
    >
      {currentProblem.exampleSolution}
    </pre>

    <button
      className="toolbar-btn secondary"
      onClick={() => setCode(currentProblem.exampleSolution || "")}
      style={{ marginTop: 10 }}
    >
      ใช้เฉลยนี้ใน editor
    </button>
  </div>
)}

          <div className="editor-footer">
            <button className="next-btn" onClick={handleNextProblem}>
              โจทย์ถัดไป
            </button>
          </div>
        </section>

        <aside className="panel output-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Output</div>
              <h2>ผลลัพธ์และการตรวจ</h2>
            </div>

            <div className={`status-badge ${status}`}>
              {status === "idle" && "ยังไม่รัน"}
              {status === "running" && "กำลังรัน"}
              {status === "success" && "สำเร็จ"}
              {status === "wrong" && "ยังไม่ถูก"}
              {status === "error" && "เกิดข้อผิดพลาด"}
            </div>
          </div>

          <div className="section-block">
            <h3>System Output</h3>
            <div className="output-box">
              <pre>{output}</pre>
            </div>
          </div>

          <div className="section-block">
            <h3>Error / Hint</h3>
            <div className={`error-box ${errorMessage ? "has-error" : ""}`}>
              <pre>{errorMessage || "ไม่มีข้อผิดพลาด"}</pre>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;