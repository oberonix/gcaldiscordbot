import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAP_PATH = join(__dirname, '..', 'event-map.json');

let map = {};

export function loadMap() {
  if (existsSync(MAP_PATH)) {
    map = JSON.parse(readFileSync(MAP_PATH, 'utf-8'));
  } else {
    map = {};
    saveMap();
  }
}

function saveMap() {
  writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
}

export function getGcalId(discordEventId) {
  return map[discordEventId] ?? null;
}

export function setMapping(discordEventId, gcalEventId) {
  map[discordEventId] = gcalEventId;
  saveMap();
}

export function removeMapping(discordEventId) {
  delete map[discordEventId];
  saveMap();
}
