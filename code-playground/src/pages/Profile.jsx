import { useEffect, useState } from "react";

export default function Profile({ onBack, onUsernameChange, onLogout }) {
  const [history, setHistory] = useState([]);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/api/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => res.json())
      .then((data) => {
        setUsername(data.username || "");
      })
      .catch((err) => {
        console.error(err);
        setMessage("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
      });

    fetch("http://localhost:8080/api/me/history", {
      headers: { Authorization: "Bearer " + token }
    })
      .then((res) => res.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setMessage("โหลดประวัติไม่สำเร็จ");
      });
  }, [token]);

  async function changeUsername() {
    try {
      setMessage("");

      const res = await fetch("http://localhost:8080/api/me/username", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ newUsername })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "เปลี่ยนชื่อไม่สำเร็จ");

      setUsername(data.username || newUsername);
      setNewUsername("");
      setMessage(data.message || "เปลี่ยนชื่อสำเร็จ");

      if (data.token) localStorage.setItem("token", data.token);
      if (data.username) {
        localStorage.setItem("username", data.username);
        if (onUsernameChange) onUsernameChange(data.username);
      }
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function changePassword() {
    try {
      setMessage("");

      const res = await fetch("http://localhost:8080/api/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");

      setCurrentPassword("");
      setNewPassword("");
      setMessage(data.message || "เปลี่ยนรหัสผ่านสำเร็จ");
    } catch (err) {
      setMessage(err.message);
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
              style={{ width: "100%", padding: 10, marginBottom: 10 }}
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
              style={{ width: "100%", padding: 10, marginBottom: 10 }}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่"
              style={{ width: "100%", padding: 10, marginBottom: 10 }}
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