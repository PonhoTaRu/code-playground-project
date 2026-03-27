import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setMessage("กรุณากรอก Username และ Password");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      console.log("Sending login:", username);

      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      console.log("Login response:", data);

      if (!res.ok) {
        setMessage(data.message || "Login ไม่สำเร็จ");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        onLogin?.(username);
      } else {
        setMessage("Login ไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      setMessage("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="auth-card">
      <h2>เข้าสู่ระบบ</h2>

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

      {message && <p className="auth-message error">{message}</p>}

      <button className="auth-submit-btn" onClick={handleLogin} disabled={loading}>
        {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
      </button>
    </div>
  );
}
