// auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const SECRET = 'my_secret_key'; // เดโม (ของจริงควรใส่ .env)

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hash],
    err => {
      if (err) {
        return res.status(400).json({ message: 'Username ซ้ำ' });
      }
      res.json({ message: 'สมัครสำเร็จ' });
    }
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (!user) {
        return res.status(401).json({ message: 'ไม่พบผู้ใช้' });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ message: 'รหัสผ่านผิด' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token });
    }
  );
};
