// filepath: public/app.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const main = document.getElementById('main');
  const torrentForm = document.getElementById('torrentForm');
  const torrentList = document.getElementById('torrentList');
  const scanPlex = document.getElementById('scanPlex');
  const logoutBtn = document.getElementById('logout');

  async function fetchTorrents() {
    const res = await fetch('/api/torrents/list');
    if (res.ok) {
      const data = await res.json();
      torrentList.innerHTML = '';
      data.torrents.forEach(t => {
        const li = document.createElement('li');
        li.textContent = `${t.name} - ${Math.round(t.progress * 100)}% - ${t.done ? 'Done' : 'Downloading'}`;
        torrentList.appendChild(li);
      });
    }
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      loginForm.style.display = 'none';
      main.style.display = '';
      fetchTorrents();
      setInterval(fetchTorrents, 5000);
    } else {
      alert('Login failed');
    }
  });

  torrentForm.addEventListener('submit', async e => {
    e.preventDefault();
    const url = document.getElementById('torrentUrl').value;
    const res = await fetch('/api/torrents/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      fetchTorrents();
      torrentForm.reset();
    } else {
      alert('Failed to add torrent');
    }
  });

  scanPlex.addEventListener('click', async () => {
    const res = await fetch('/api/plex/scan', { method: 'POST' });
    if (res.ok) {
      alert('Plex scan triggered');
    } else {
      alert('Failed to trigger Plex scan');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    loginForm.style.display = '';
    main.style.display = 'none';
  });
});