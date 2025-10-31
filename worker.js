// Cloudflare Worker for Twitch stream info
let cachedToken = null;
let tokenExpiry = 0;

async function getTwitchAppAccessToken(env) {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const params = new URLSearchParams();
  params.append("client_id", env.TWITCH_CLIENT_ID);
  params.append("client_secret", env.TWITCH_CLIENT_SECRET);
  params.append("grant_type", "client_credentials");

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000) - 60000;
  return cachedToken;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/twitch-stream") {
      const username = url.searchParams.get("username");
      if (!username) {
        return new Response(JSON.stringify({ error: "Missing username" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        const token = await getTwitchAppAccessToken(env);
        const twitchRes = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(username.toLowerCase())}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Client-Id": env.TWITCH_CLIENT_ID
            }
          }
        );
        const twitchData = await twitchRes.text();
        return new Response(twitchData, {
          status: twitchRes.status,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Internal server error", details: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    return new Response("Not found", { status: 404 });
  }
};
