const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("./db");

const SECRET = process.env.JWT_SECRET || "my_secret_key";

async function register(req, res) {
  const { username, password } = req.body;

  if (!String(username || "").trim() || !String(password || "").trim()) {
    return res.status(400).json({ message: "กรุณากรอก username และ password" });
  }

  if (String(password).length < 4) {
    return res.status(400).json({ message: "รหัสผ่านสั้นเกินไป" });
  }

  try {
    const hashed = await bcrypt.hash(String(password), 10);

    db.run(
      "INSERT INTO users(username,password) VALUES (?,?)",
      [String(username).trim(), hashed],
      function (err) {
        if (err) {
          return res.status(400).json({ message: "username already exists" });
        }

        return res.json({ success: true, message: "สมัครสมาชิกสำเร็จ" });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "สมัครสมาชิกไม่สำเร็จ" });
  }
}

function isBcryptHash(value = "") {
  return /^\$2[aby]\$/.test(String(value));
}

async function login(req, res) {
  const { username, password } = req.body;

  if (!String(username || "").trim() || !String(password || "").trim()) {
    return res.status(400).json({ message: "กรุณากรอก username และ password" });
  }

  db.get(
    "SELECT * FROM users WHERE username=?",
    [String(username).trim()],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "เข้าสู่ระบบไม่สำเร็จ" });
      }

      if (!user) {
        return res.status(401).json({ message: "invalid credentials" });
      }

      let isValid = false;
      const inputPassword = String(password);

      if (isBcryptHash(user.password)) {
        isValid = await bcrypt.compare(inputPassword, user.password);
      } else {
        // backward compatibility for legacy plain-text rows
        isValid = user.password === inputPassword;
      }

      if (!isValid) {
        return res.status(401).json({ message: "invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        token,
        username: user.username
      });
    }
  );
}

module.exports = {
  register,
  login
};
