import { useState } from "react";

export default function Register({ onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage("กรุณากรอกข้อมูลให้ครบ");
      setSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("รหัสผ่านไม่ตรงกัน");
      setSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "สมัครสมาชิกไม่สำเร็จ");
        setSuccess(false);
        return;
      }

      setMessage(data.message || "สมัครสมาชิกสำเร็จ");
      setSuccess(true);
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onRegisterSuccess?.();
      }, 800);
    } catch (error) {
      console.error(error);
      setMessage("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="auth-card">
      <h2>สมัครสมาชิก</h2>

      <input
        className="auth-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <input
        className="auth-input"
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {message && (
        <p className={`auth-message ${success ? "success" : "error"}`}>
          {message}
        </p>
      )}

      <button
        className="auth-submit-btn"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "กำลังสมัคร..." : "Register"}
      </button>
    </div>
  );
}