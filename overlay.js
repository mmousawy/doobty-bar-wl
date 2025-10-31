let barUsername = '';
let twitchUsername = '';
let streamStartTime = null;
let wins = 0;
let losses = 0;
let isLoading = false;

// Get usernames from URL query parameters
function getBarUsernameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const nameParam = urlParams.get('barUsername');
  return nameParam ? nameParam.trim() : null;
}
function getTwitchUsernameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const nameParam = urlParams.get('twitchUsername');
  return nameParam ? nameParam.trim() : null;
}

function getBackendUrl() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
    return 'http://localhost:8080';
  }
  return 'https://doobty-bar-wl-be.murtada-al-mousawy.workers.dev';
}

async function loadSettings() {
  barUsername = getBarUsernameFromURL() || '';
  twitchUsername = getTwitchUsernameFromURL() || '';
  streamStartTime = null;
  const startedAt = await fetchTwitchStreamStartTime(twitchUsername);
  streamStartTime = startedAt ? new Date(startedAt) : null;
}

// Update display
function updateDisplay() {
  document.getElementById('wins').textContent = wins;
  document.getElementById('losses').textContent = losses;
}

// Fetch stats from BAR API
async function fetchStats() {
  if (!barUsername) {
    console.error('No BAR username provided. Add ?barUsername=PlayerName to URL');
    return;
  }
  if (!streamStartTime) {
    console.error('Could not get stream start time from Twitch. Are you live?');
    return;
  }
  if (isLoading) return;
  isLoading = true;
  try {
    document.getElementById('wins').textContent = '...';
    document.getElementById('losses').textContent = '...';
    const response = await fetch(`https://api.bar-rts.com/replays?players=${encodeURIComponent(barUsername)}&limit=100`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    let newWins = 0;
    let newLosses = 0;
    // Filter matches since stream start time
    const filteredMatches = data.data.filter(match => {
      const matchTime = new Date(match.startTime);
      return matchTime >= streamStartTime;
    });
    // Count wins and losses
    filteredMatches.forEach(match => {
      const playerTeam = match.AllyTeams.find(team =>
        team.Players.some(player => player.name === barUsername)
      );
      if (playerTeam) {
        if (playerTeam.winningTeam) {
          newWins++;
        } else {
          newLosses++;
        }
      }
    });
    wins = newWins;
    losses = newLosses;
    updateDisplay();
  } catch (error) {
    console.error('Error fetching stats:', error);
    document.getElementById('wins').textContent = '?';
    document.getElementById('losses').textContent = '?';
  } finally {
    isLoading = false;
  }
}

// Fetch Twitch stream start time using the app access token
async function fetchTwitchStreamStartTime(username) {
  if (!username) return null;
  try {
    const response = await fetch(`${getBackendUrl()}/twitch-stream?username=${encodeURIComponent(username)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].started_at;
    }
  } catch (err) {
    console.error('Twitch API error:', err);
  }
  return null;
}

function startAutoRefresh() {
  setInterval(fetchStats, 120000); // 2 minutes
}

async function init() {
  await loadSettings();
  if (barUsername && streamStartTime) {
    fetchStats();
  }
  startAutoRefresh();
}

init();
