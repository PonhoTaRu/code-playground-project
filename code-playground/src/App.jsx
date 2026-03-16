import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";

const starterCode = `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

// เขียนโค้ดที่นี่
`;

const problemBank = [
  {
    id: 1,
    level: "easy",
    title: "กลับลำดับข้อความ",
    description: "อ่านข้อความ 1 บรรทัด แล้วแสดงข้อความนั้นในลำดับกลับกัน",
    difficulty: "easy",
    points: 10,
    hint: [
      "อาจใช้ split(''), reverse(), join('')",
      "อ่านข้อความจาก input ให้ครบก่อน",
    ],
    exampleInput: "student",
    exampleOutput: "tneduts",
    expectedOutput: "tneduts",
    starter: starterCode,
  },
  {
    id: 2,
    level: "easy",
    title: "พิมพ์คำทักทาย",
    description: "ให้รับชื่อ 1 ชื่อ แล้วพิมพ์คำว่า สวัสดี ตามด้วยชื่อที่รับมา",
    difficulty: "easy",
    points: 10,
    hint: ["ใช้การต่อ string", "ระวังเว้นวรรคหลังคำว่า สวัสดี"],
    exampleInput: "มินท์",
    exampleOutput: "สวัสดี มินท์",
    expectedOutput: "สวัสดี มินท์",
    starter: starterCode,
  },
  {
    id: 3,
    level: "medium",
    title: "แปลงเป็นตัวพิมพ์ใหญ่",
    description: "อ่านข้อความ 1 บรรทัด แล้วแสดงผลเป็นตัวพิมพ์ใหญ่ทั้งหมด",
    difficulty: "medium",
    points: 20,
    hint: ["ใน JavaScript ใช้ toUpperCase()"],
    exampleInput: "code playground",
    exampleOutput: "CODE PLAYGROUND",
    expectedOutput: "CODE PLAYGROUND",
    starter: starterCode,
  },
  {
    id: 4,
    level: "medium",
    title: "นับจำนวนตัวอักษร",
    description: "อ่านข้อความ 1 บรรทัด แล้วแสดงจำนวนตัวอักษรทั้งหมด",
    difficulty: "medium",
    points: 20,
    hint: ["ใช้ .length", "ถ้า trim แล้วความยาวจะไม่รวมช่องว่างหัวท้าย"],
    exampleInput: "hello",
    exampleOutput: "5",
    expectedOutput: "5",
    starter: starterCode,
  },
  {
    id: 5,
    level: "hard",
    title: "รวมตัวเลขสองจำนวน",
    description:
      "รับตัวเลข 2 จำนวนคั่นด้วยช่องว่างในบรรทัดเดียว แล้วแสดงผลรวมของสองจำนวน",
    difficulty: "hard",
    points: 30,
    hint: ["แยก input ด้วย split(' ')", "แปลงเป็น Number ก่อนบวก"],
    exampleInput: "5 7",
    exampleOutput: "12",
    expectedOutput: "12",
    starter: starterCode,
  },
  {
    id: 6,
    level: "hard",
    title: "ตรวจคำ palindrome",
    description:
      "อ่านข้อความ 1 บรรทัด ถ้าอ่านจากหน้าไปหลังและหลังไปหน้าเหมือนกัน ให้แสดง yes ไม่งั้นแสดง no",
    difficulty: "hard",
    points: 30,
    hint: ["เปรียบเทียบข้อความเดิมกับข้อความกลับด้าน"],
    exampleInput: "level",
    exampleOutput: "yes",
    expectedOutput: "yes",
    starter: starterCode,
  },
];

function normalizeText(text) {
  return String(text).replace(/\r/g, "").trim();
}

function getDifficultyLabel(diff) {
  if (diff === "easy") return "ง่าย";
  if (diff === "medium") return "ปานกลาง";
  if (diff === "hard") return "ยาก";
  return diff;
}

function getRandomProblems(problems, count = 3) {
  const shuffled = [...problems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function App() {
  const [levelFilter, setLevelFilter] = useState("all");
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState(starterCode);
  const [customOutput, setCustomOutput] = useState("");
  const [status, setStatus] = useState("idle");
  const [output, setOutput] = useState("ยังไม่มีผลลัพธ์");
  const [errorMessage, setErrorMessage] = useState("");
  const [solvedIds, setSolvedIds] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");

  const baseProblems = useMemo(() => {
    if (levelFilter === "all") return problemBank;
    return problemBank.filter((p) => p.level === levelFilter);
  }, [levelFilter]);

  const [roundProblems, setRoundProblems] = useState(() =>
    getRandomProblems(problemBank, 3)
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");

    if (token) {
      setIsLoggedIn(true);
      setUsername(savedUsername || "");
    }
  }, []);

  useEffect(() => {
    const nextRound = getRandomProblems(baseProblems, 3);
    setRoundProblems(nextRound);
    setCurrentIndex(0);
    setSolvedIds([]);
    setScore(0);

    const firstProblem = nextRound[0];
    setCode(firstProblem?.starter || starterCode);
    setCustomOutput("");
    setStatus("idle");
    setOutput("ยังไม่มีผลลัพธ์");
    setErrorMessage("");
  }, [baseProblems]);

  const currentProblem = roundProblems[currentIndex];

  const progressPercent = roundProblems.length
    ? ((currentIndex + 1) / roundProblems.length) * 100
    : 0;

  const solvedCountInRound = roundProblems.filter((p) =>
    solvedIds.includes(p.id)
  ).length;

  const resetWorkspaceForProblem = (problem) => {
    setCode(problem?.starter || starterCode);
    setCustomOutput("");
    setStatus("idle");
    setOutput("ยังไม่มีผลลัพธ์");
    setErrorMessage("");
  };

  const startNewRound = () => {
    const nextRound = getRandomProblems(baseProblems, 3);
    setRoundProblems(nextRound);
    setScore(0);
    setCurrentIndex(0);
    setSolvedIds([]);
    setOutput("ยังไม่มีผลลัพธ์");
    setErrorMessage("");
    setStatus("idle");
    setCustomOutput("");

    const firstProblem = nextRound[0];
    setCode(firstProblem?.starter || starterCode);
  };

  const handleLevelChange = (e) => {
    setLevelFilter(e.target.value);
  };

  const handleRestart = () => {
    startNewRound();
  };

  const handleResetCode = () => {
    if (!currentProblem) return;
    setCode(currentProblem.starter || starterCode);
    setCustomOutput("");
    setStatus("idle");
    setOutput("รีเซ็ตโค้ดแล้ว");
    setErrorMessage("");
  };

  const handleRun = () => {
    if (!currentProblem) return;

    setErrorMessage("");

    if (!customOutput.trim()) {
      setStatus("warning");
      setOutput(
        "ยังไม่ได้กรอกผลลัพธ์จำลอง\n\nตอนนี้เวอร์ชันนี้เป็น UI พร้อมใช้ทันที\nให้พิมพ์ผลลัพธ์ที่ต้องการทดสอบในช่อง 'ผลลัพธ์จำลองจากโค้ด' ด้านขวา แล้วกด Run หรือ Submit"
      );
      return;
    }

    setStatus("running");
    setTimeout(() => {
      setStatus("success");
      setOutput(customOutput);
    }, 250);
  };

  const handleSubmit = () => {
    if (!currentProblem) return;

    const actual = normalizeText(customOutput);
    const expected = normalizeText(currentProblem.expectedOutput);

    if (!actual) {
      setStatus("error");
      setErrorMessage("กรุณากรอกผลลัพธ์จำลองก่อนกด Submit");
      setOutput("ยังไม่มีผลลัพธ์สำหรับตรวจ");
      return;
    }

    if (actual === expected) {
      const alreadySolved = solvedIds.includes(currentProblem.id);

      setStatus("success");
      setErrorMessage("");
      setOutput(
        `✅ Correct\n\nExpected: ${currentProblem.expectedOutput}\nYour Output: ${actual}\n\n+${
          alreadySolved ? 0 : currentProblem.points
        } คะแนน`
      );

      if (!alreadySolved) {
        setSolvedIds((prev) => [...prev, currentProblem.id]);
        setScore((prev) => prev + currentProblem.points);
      }
    } else {
      setStatus("wrong");
      setErrorMessage("ผลลัพธ์ยังไม่ตรงกับโจทย์");
      setOutput(
        `❌ Wrong Answer\n\nExpected: ${currentProblem.expectedOutput}\nYour Output: ${actual}`
      );
    }
  };

  const handleNextProblem = () => {
    if (!roundProblems.length) return;

    const nextIndex = currentIndex + 1;

    if (nextIndex >= roundProblems.length) {
      setStatus("idle");
      setOutput("จบรอบแล้ว กด 'เริ่มรอบใหม่' เพื่อสุ่มโจทย์ชุดใหม่");
      setErrorMessage("");
      return;
    }

    setCurrentIndex(nextIndex);
    resetWorkspaceForProblem(roundProblems[nextIndex]);
  };

  const handleLoginSuccess = (name) => {
    setIsLoggedIn(true);
    setUsername(name || localStorage.getItem("username") || "");
  };

  const handleRegisterSuccess = () => {
    setAuthMode("login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
    setAuthMode("login");
  };

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
        <p>ไม่พบโจทย์ในระดับที่เลือก</p>
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
            <select value={levelFilter} onChange={handleLevelChange}>
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
              {solvedCountInRound}/{roundProblems.length}
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
            ข้อที่ {currentIndex + 1} / {roundProblems.length}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
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
            <span>คะแนนข้อนี้: {currentProblem.points}</span>
            <span>Level: {currentProblem.level}</span>
          </div>

          <div className="card-block">
            <p>{currentProblem.description}</p>
          </div>

          <div className="section-block">
            <h3>คำใบ้</h3>
            <ul>
              {currentProblem.hint.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="section-block">
            <h3>ตัวอย่าง</h3>
            <div className="example-box">
              <div>
                <strong>Input</strong>
                <pre>{currentProblem.exampleInput}</pre>
              </div>
              <div>
                <strong>Output</strong>
                <pre>{currentProblem.exampleOutput}</pre>
              </div>
            </div>
          </div>
        </aside>

        <section className="panel editor-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Editor</div>
              <h2>JavaScript</h2>
            </div>

            <div className="toolbar">
              <button className="toolbar-btn secondary" onClick={handleRun}>
                Run
              </button>
              <button className="toolbar-btn primary" onClick={handleSubmit}>
                Submit
              </button>
              <button
                className="toolbar-btn secondary"
                onClick={handleResetCode}
              >
                Reset
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
              {status === "warning" && "รอผลลัพธ์"}
              {status === "error" && "เกิดข้อผิดพลาด"}
            </div>
          </div>

          <div className="section-block">
            <h3>ผลลัพธ์จำลองจากโค้ด</h3>
            <textarea
              className="mock-output-input"
              value={customOutput}
              onChange={(e) => setCustomOutput(e.target.value)}
              placeholder="พิมพ์ output ที่โค้ดของคุณควรแสดง เช่น tneduts"
            />
          </div>

          <div className="section-block">
            <h3>System Output</h3>
            <div className="output-box">
              <pre>{output}</pre>
            </div>
          </div>

          <div className="section-block">
            <h3>Error</h3>
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