document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('main');
  const torrentForm = document.getElementById('torrentForm');
  const torrentList = document.getElementById('torrentList');
  const scanPlex = document.getElementById('scanPlex');
  const logView = document.getElementById('logView');
  const clearLogBtn = document.getElementById('clearLog');
  const toggleThemeBtn = document.getElementById('toggleTheme');
  const body = document.body;
  const torrentType = document.getElementById('torrentType');
  const torrentUrlInput = document.getElementById('torrentUrl');

  // Always show the main app
  main.style.display = '';

  // Theme toggle
  toggleThemeBtn.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    }
  });

  function formatSpeed(bytesPerSec) {
    if (bytesPerSec >= 1024 * 1024) {
      return (bytesPerSec / (1024 * 1024)).toFixed(2) + ' MB/s';
    } else if (bytesPerSec >= 1024) {
      return (bytesPerSec / 1024).toFixed(2) + ' KB/s';
    } else {
      return bytesPerSec + ' B/s';
    }
  }

  function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    entry.className = `log-entry log-${type}`;
    logView.appendChild(entry);
    logView.scrollTop = logView.scrollHeight; // auto-scroll
  }

  async function fetchTorrents() {
    addLog('Fetching torrent list...', 'progress');
    try {
      const res = await fetch('/api/torrents/list');
      if (res.ok) {
        addLog('Torrent list fetched.', 'success');
        const data = await res.json();
        torrentList.innerHTML = '';
        data.torrents.forEach(t => {
          const li = document.createElement('li');
          li.textContent =
            `${t.name} - ${Math.round(t.progress * 100)}% - ${t.done ? 'Done' : 'Downloading'} | ` +
            `Speed: ${formatSpeed(t.currentSpeed)} (current), ${formatSpeed(t.averageSpeed)} (avg 2min)`;
          torrentList.appendChild(li);
          addLog(
            `Torrent: ${t.name}, Progress: ${Math.round(t.progress * 100)}%, Status: ${t.done ? 'Done' : 'Downloading'}, ` +
            `Speed: ${formatSpeed(t.currentSpeed)} (current), ${formatSpeed(t.averageSpeed)} (avg 2min)`,
            'progress'
          );
        });
      } else {
        addLog(`Failed to fetch torrent list. Status: ${res.status}`, 'error');
      }
    } catch (err) {
      addLog(`Error fetching torrents: ${err}`, 'error');
    }
  }

  // Start fetching torrents immediately and every 5 seconds
  fetchTorrents();
  setInterval(fetchTorrents, 5000);

  torrentForm.addEventListener('submit', async e => {
    e.preventDefault();
    const url = torrentUrlInput.value;
    const type = torrentType.value;
    addLog(`Attempting to add torrent: ${url}`, 'info');
    try {
      const res = await fetch('/api/torrents/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });
      if (res.ok) {
        addLog('Torrent added successfully.', 'success');
        fetchTorrents();
        torrentForm.reset();
      } else {
        addLog(`Failed to add torrent. Status: ${res.status}`, 'error');
        alert('Failed to add torrent');
      }
    } catch (err) {
      addLog(`Error adding torrent: ${err}`, 'error');
      alert('Error adding torrent');
    }
  });

  scanPlex.addEventListener('click', async () => {
    addLog('Triggering Plex scan...', 'info');
    try {
      const res = await fetch('/api/plex/scan', { method: 'POST' });
      if (res.ok) {
        addLog('Plex scan triggered.', 'success');
        alert('Plex scan triggered');
      } else {
        addLog(`Failed to trigger Plex scan. Status: ${res.status}`, 'error');
        alert('Failed to trigger Plex scan');
      }
    } catch (err) {
      addLog(`Error triggering Plex scan: ${err}`, 'error');
      alert('Error triggering Plex scan');
    }
  });

  clearLogBtn.addEventListener('click', () => {
    logView.innerHTML = '';
    addLog('Log cleared.', 'info');
  });

  // Optional: Suggest type based on input
  torrentUrlInput.addEventListener('input', () => {
    const value = torrentUrlInput.value;
    if (/S\d{1,2}E\d{1,2}/i.test(value)) {
      torrentType.value = 'tv';
    } else {
      torrentType.value = 'movie';
    }
  });
});