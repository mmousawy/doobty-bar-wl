const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();
const app = express();

app.use(cors());

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

// Get Twitch app access token (with caching)
async function getTwitchAppAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const params = new URLSearchParams();
  params.append('client_id', TWITCH_CLIENT_ID);
  params.append('client_secret', TWITCH_CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const text = await res.text();
  const data = JSON.parse(text);
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000) - 60000; // 1 min early
  return cachedToken;
}

// Proxy endpoint for Twitch stream info
app.get('/twitch-stream', async (req, res) => {
  let username = req.query.username;
  console.log('Received username param:', username);
  if (!username) return res.status(400).json({ error: 'Missing username' });

  username = username.toLowerCase();

  try {
    const token = await getTwitchAppAccessToken();
    const twitchUrl = `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(username)}`;
    console.log('Requesting Twitch API URL:', twitchUrl);
    const twitchRes = await fetch(twitchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': TWITCH_CLIENT_ID
      }
    });
    const twitchText = await twitchRes.text();
    if (!twitchRes.ok) {
      console.error(`Twitch API error: ${twitchRes.status} ${twitchRes.statusText}`);
      return res.status(twitchRes.status).json({
        error: 'Twitch API error',
        status: twitchRes.status,
        statusText: twitchRes.statusText,
        body: twitchText
      });
    }
    const data = JSON.parse(twitchText);
    res.json(data);
  } catch (err) {
    console.error('Error in /twitch-stream:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
