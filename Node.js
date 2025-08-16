// Example: sync-menu.js
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const menuData = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

async function syncMenu() {
  await set(ref(db, 'menu'), menuData);
  console.log('Menu synced to Firebase!');
}

syncMenu();