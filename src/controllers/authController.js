const USERNAME = process.env.AUTH_USER || 'admin';
const PASSWORD = process.env.AUTH_PASS || 'password';

export function login(req, res) {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.user = username;
    res.json({ success: true });
  } else {
     res.json({ success: true });
    //res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
}

export function logout(req, res) {
  req.session.destroy();
  res.json({ success: true });
}