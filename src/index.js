import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { initCalendar, createEvent, updateEvent, deleteEvent } from './calendar.js';
import { loadMap, getGcalId, setMapping, removeMapping } from './event-map.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
  ],
});

function extractEventData(event) {
  return {
    title: event.name,
    description: event.description,
    startTime: event.scheduledStartAt,
    endTime: event.scheduledEndAt,
    location: event.entityMetadata?.location ?? null,
  };
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildScheduledEventCreate', async (event) => {
  try {
    const gcalId = await createEvent(extractEventData(event));
    setMapping(event.id, gcalId);
    console.log(`Mapped discord:${event.id} → gcal:${gcalId}`);
  } catch (err) {
    console.error('Failed to create gcal event:', err.message);
  }
});

client.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {
  try {
    const gcalId = getGcalId(newEvent.id);
    if (!gcalId) {
      // No mapping exists — create a new event instead
      const newGcalId = await createEvent(extractEventData(newEvent));
      setMapping(newEvent.id, newGcalId);
      console.log(`Created missing mapping discord:${newEvent.id} → gcal:${newGcalId}`);
      return;
    }
    await updateEvent(gcalId, extractEventData(newEvent));
  } catch (err) {
    console.error('Failed to update gcal event:', err.message);
  }
});

client.on('guildScheduledEventDelete', async (event) => {
  try {
    const gcalId = getGcalId(event.id);
    if (!gcalId) return;
    await deleteEvent(gcalId);
    removeMapping(event.id);
  } catch (err) {
    console.error('Failed to delete gcal event:', err.message);
  }
});

async function main() {
  loadMap();
  await initCalendar();
  await client.login(process.env.DISCORD_BOT_TOKEN);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
