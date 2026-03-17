import { useEffect, useState } from "react";

export default function Profile({ onBack, onUsernameChange, onLogout }) {
  const [history, setHistory] = useState([]);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
  setMessage("token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่");
  throw new Error("token ไม่ถูกต้องหรือหมดอายุ");
}

    if (!res.ok) {
      throw new Error(data.message || "เกิดข้อผิดพลาด");
    }

    return data;
  }

  useEffect(() => {
    if (!token) {
      setMessage("ไม่พบ token กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    Promise.all([
      fetchJson("http://localhost:8080/api/me", {
        headers: { Authorization: "Bearer " + token }
      }),
      fetchJson("http://localhost:8080/api/me/history", {
        headers: { Authorization: "Bearer " + token }
      })
    ])
      .then(([meData, historyData]) => {
        setUsername(meData.username || "");
        setHistory(Array.isArray(historyData) ? historyData : []);
      })
      .catch((err) => {
        console.error(err);
        if (!String(err.message || "").includes("token")) {
          setMessage(err.message || "โหลดข้อมูลไม่สำเร็จ");
        }
      });
  }, [token, onLogout]);

  async function changeUsername() {
    try {
      setMessage("");

      if (!newUsername.trim()) {
        setMessage("กรุณากรอกชื่อผู้ใช้ใหม่");
        return;
      }

      const data = await fetchJson("http://localhost:8080/api/me/username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ newUsername: newUsername.trim() })
      });

      const updatedUsername = data.username || newUsername.trim();

      setUsername(updatedUsername);
      setNewUsername("");
      setMessage(data.message || "เปลี่ยนชื่อสำเร็จ");

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      localStorage.setItem("username", updatedUsername);
      if (onUsernameChange) onUsernameChange(updatedUsername);
    } catch (err) {
      setMessage(err.message || "เปลี่ยนชื่อไม่สำเร็จ");
    }
  }

  async function changePassword() {
    try {
      setMessage("");

      if (!currentPassword || !newPassword) {
        setMessage("กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่");
        return;
      }

      const data = await fetchJson("http://localhost:8080/api/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      setCurrentPassword("");
      setNewPassword("");
      setMessage(data.message || "เปลี่ยนรหัสผ่านสำเร็จ");
    } catch (err) {
      setMessage(err.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    }
  }

  return (
    <div className="app-shell" style={{ padding: 24 }}>
      <header className="topbar">
        <div className="topbar-left">
          <h1>Profile</h1>
          <p className="topbar-subtitle">จัดการบัญชีผู้ใช้และดูประวัติการเล่น</p>
        </div>

        <div className="topbar-right">
          <button className="ghost-btn" onClick={onBack}>
            กลับหน้าหลัก
          </button>
          <button className="ghost-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="workspace" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">Account</div>
              <h2>{username || "ผู้ใช้"}</h2>
            </div>
          </div>

          <div className="section-block">
            <h3>เปลี่ยนชื่อผู้ใช้</h3>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="ชื่อผู้ใช้ใหม่"
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#fff",
                boxSizing: "border-box"
              }}
            />
            <button className="toolbar-btn primary" onClick={changeUsername}>
              บันทึกชื่อใหม่
            </button>
          </div>

          <div className="section-block">
            <h3>เปลี่ยนรหัสผ่าน</h3>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="รหัสผ่านเดิม"
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#fff",
                boxSizing: "border-box"
              }}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่"
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#fff",
                boxSizing: "border-box"
              }}
            />
            <button className="toolbar-btn primary" onClick={changePassword}>
              เปลี่ยนรหัสผ่าน
            </button>
          </div>

          <div className="section-block">
            <h3>ข้อความระบบ</h3>
            <div className="output-box">
              <pre>{message || "พร้อมใช้งาน"}</pre>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">History</div>
              <h2>ประวัติการเล่น</h2>
            </div>
          </div>

          <div className="section-block">
            {history.length === 0 ? (
              <p>ยังไม่มีประวัติการเล่น</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 8 }}>โจทย์</th>
                      <th style={{ textAlign: "left", padding: 8 }}>ระดับ</th>
                      <th style={{ textAlign: "left", padding: 8 }}>ผลลัพธ์</th>
                      <th style={{ textAlign: "left", padding: 8 }}>คะแนน</th>
                      <th style={{ textAlign: "left", padding: 8 }}>เวลา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td style={{ padding: 8 }}>{h.problem_title}</td>
                        <td style={{ padding: 8 }}>{h.difficulty || "-"}</td>
                        <td style={{ padding: 8 }}>{h.status}</td>
                        <td style={{ padding: 8 }}>{h.score}</td>
                        <td style={{ padding: 8 }}>{h.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}