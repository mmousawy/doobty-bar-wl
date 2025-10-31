# BAR Wins Losses Overlay

This project provides a simple overlay for streamers to display their BAR (Beyond All Reason) wins and losses during a Twitch stream. It includes a frontend overlay generator, a stats overlay, and a Cloudflare Worker backend for Twitch stream info.

## Features

- Generates a custom overlay URL for your stream.
- Displays live wins and losses for your BAR username since the start of your Twitch stream.
- Option to only count games with large teams (8v8).
- Cloudflare Worker backend fetches Twitch stream start time so it only counts matches since start of stream.

## Files

- `index.html`: Overlay URL generator for streamers.
- `render.html`: The overlay page to display on stream (shows wins/losses).
- `overlay.js`: Fetches BAR stats and updates the overlay.
- `style.css`: Styling for the overlay.
- `worker.js`: Cloudflare Worker backend for Twitch stream info.
- `.env.example`: Example environment variables for Twitch API credentials.
- `wrangler.toml`: Cloudflare Worker configuration.

## Requirements

- A Twitch app (get your Client ID and Secret from https://dev.twitch.tv/console/apps)
- Cloudflare account (for deploying the Worker)
- BAR username and Twitch username

## Setup

1. **Clone the repository**
2. **Configure Twitch API credentials**
   - Copy `.env.example` to `.env` and fill in your Twitch Client ID and Secret.
3. **Deploy the Cloudflare Worker**
   - Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install/)
   - Run `wrangler login` to authenticate.
   - Deploy with `wrangler publish`
4. **Serve the frontend**
   - You can use any static file server (e.g., `npx serve .` or host on Cloudflare Pages).

## Local Development

To run the backend locally using Wrangler:

1. Make sure you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install/) installed.
2. Set up your `.env` file with your Twitch credentials (see `.env.example`).
3. Start the Worker locally:
   
   ```bash
   wrangler dev
   ```
   This will start the Worker on `http://localhost:8787` by default.

To serve the frontend locally:

1. Use any static file server (for example, with Node.js):
   
   ```bash
   npx serve .
   ```
   or open `index.html` directly in your browser.

Make sure your overlay and generator point to the local backend when testing locally.

## Usage

1. Open `index.html` in your browser.
2. Enter your BAR and Twitch usernames.
3. (Optional) Check "Only count score for large teams (8v8)".
4. Click "Generate Overlay URL" and copy the URL.
5. Add the generated URL as a browser source in your streaming software (OBS, etc.).

## Notes

- Usernames are case-sensitive.
- The overlay will auto-refresh every minute.
- The backend Worker must be running and accessible for Twitch stream info.

## License

MIT
