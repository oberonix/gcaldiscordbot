# Discord → Google Calendar Sync Bot

Syncs Discord scheduled events to a shared Google Calendar ("Scotch Egg Events").

## Setup

### 1. Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use an existing one)
3. Enable the **Google Calendar API**
4. Create a **Service Account** under IAM & Admin → Service Accounts
5. Create a JSON key for the service account and save it as `service-account.json` in the project root

### 2. Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application and add a bot
3. Enable the **Guild Scheduled Events** intent under Bot → Privileged Gateway Intents
4. Invite the bot to your server with the `Manage Events` permission and `applications.commands` scope

### 3. Configuration

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

- `DISCORD_BOT_TOKEN` — Your Discord bot token
- `GOOGLE_SERVICE_ACCOUNT_JSON` — Path to your service account JSON key file (default: `./service-account.json`)
- `GOOGLE_CALENDAR_NAME` — Name of the calendar to create/use (default: `Scotch Egg Events`)

### 4. Install & Run

```bash
npm install
npm start
```

On first run, the bot will automatically create a Google Calendar named "Scotch Egg Events" and make it publicly readable.

## Running as a launchd Service (macOS)

Create `~/Library/LaunchAgents/com.gcaldiscordbot.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gcaldiscordbot</string>
    <key>WorkingDirectory</key>
    <string>/path/to/gcaldiscordbot</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>src/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/gcaldiscordbot.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/gcaldiscordbot.err</string>
</dict>
</plist>
```

Then load it:

```bash
launchctl load ~/Library/LaunchAgents/com.gcaldiscordbot.plist
```

## How It Works

- Listens for Discord scheduled event create/update/delete
- Syncs each event to Google Calendar with the same title, description, time, and location
- Stores Discord ↔ Google Calendar event ID mappings in `event-map.json`
