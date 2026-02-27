import { google } from 'googleapis';
import { readFileSync } from 'node:fs';

let calendar;
let calendarId;

export async function initCalendar() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || './service-account.json';
  const credentials = JSON.parse(readFileSync(keyFile, 'utf-8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  calendar = google.calendar({ version: 'v3', auth });
  calendarId = await getOrCreateCalendar();
  console.log(`Using calendar: ${process.env.GOOGLE_CALENDAR_NAME} (${calendarId})`);
}

async function getOrCreateCalendar() {
  const name = process.env.GOOGLE_CALENDAR_NAME || 'Scotch Egg Events';

  // Check if calendar already exists
  const { data } = await calendar.calendarList.list();
  const existing = data.items?.find((c) => c.summary === name);
  if (existing) return existing.id;

  // Create new calendar
  const { data: created } = await calendar.calendars.insert({
    requestBody: { summary: name, timeZone: 'UTC' },
  });

  // Make it publicly readable
  await calendar.acl.insert({
    calendarId: created.id,
    requestBody: { role: 'reader', scope: { type: 'default' } },
  });

  console.log(`Created calendar "${name}"`);
  return created.id;
}

export async function createEvent({ title, description, startTime, endTime, location }) {
  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: buildEventBody({ title, description, startTime, endTime, location }),
  });
  console.log(`Created gcal event: ${data.id}`);
  return data.id;
}

export async function updateEvent(gcalEventId, { title, description, startTime, endTime, location }) {
  await calendar.events.update({
    calendarId,
    eventId: gcalEventId,
    requestBody: buildEventBody({ title, description, startTime, endTime, location }),
  });
  console.log(`Updated gcal event: ${gcalEventId}`);
}

export async function deleteEvent(gcalEventId) {
  await calendar.events.delete({ calendarId, eventId: gcalEventId });
  console.log(`Deleted gcal event: ${gcalEventId}`);
}

function buildEventBody({ title, description, startTime, endTime, location }) {
  const body = {
    summary: title,
    description: description || '',
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: (endTime ?? new Date(startTime.getTime() + 3600000)).toISOString() },
  };
  if (location) body.location = location;
  return body;
}
