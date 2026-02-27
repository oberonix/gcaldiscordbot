# Discord → Google Calendar Sync Bot

## Overview
Node.js Discord bot that syncs Discord scheduled events to a shared Google Calendar.

## Requirements
1. Listen for Discord scheduled events (create, update, delete)
2. Sync to Google Calendar using a service account
3. On first run, create a calendar called "Scotch Egg Events" (save calendar ID)
4. Store Discord event ID → Google Calendar event ID mapping in `event-map.json`
5. Handle: new events, updated events, deleted events
6. Run on Mac mini (systemd/launchd service optional, but include instructions)

## Tech Stack
- Node.js (ES modules)
- discord.js v14+
- googleapis (Google Calendar API v3)
- dotenv for config

## Config (.env)
```
DISCORD_BOT_TOKEN=
GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json
GOOGLE_CALENDAR_NAME=Scotch Egg Events
```

## Event Mapping
When a Discord scheduled event is created:
- Create corresponding Google Calendar event with same title, description, start/end time, location
- Store mapping in event-map.json: `{ "discord_event_id": "gcal_event_id" }`

When updated:
- Look up gcal event ID from mapping, update it

When deleted:
- Look up gcal event ID from mapping, delete it, remove from mapping

## Discord Intents Needed
- GuildScheduledEvents

## Google Calendar Setup
- Use service account (no OAuth)
- On first run, create calendar "Scotch Egg Events"
- Make it publicly readable (or share with specific emails via config)

## Files to Create
- package.json
- src/index.js (main bot)
- src/calendar.js (Google Calendar wrapper)
- src/event-map.js (JSON persistence)
- .env.example
- README.md (setup instructions)
