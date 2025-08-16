export function login(req, res) {
  // No authentication logic needed
  req.session.user = 'admin';
  res.json({ success: true });
}

export function logout(req, res) {
  req.session.destroy();
  res.json({ success: true });
}