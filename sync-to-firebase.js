const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const fs = require('fs').promises;

const firebaseConfig = {
    apiKey: "AIzaSyBA38-BPBHEO3WmPDMcTaO7W91CfBE8mv0",
    authDomain: "vosabushka.firebaseapp.com",
    projectId: "vosabushka",
    storageBucket: "vosabushka.firebasestorage.app",
    messagingSenderId: "665821972347",
    appId: "1:665821972347:web:9c79680300571755f05fde",
    measurementId: "G-G58JGVJ03F"
};

async function syncMenu() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const menuData = JSON.parse(await fs.readFile('menu.json', 'utf8'));
        await set(ref(db, 'menu'), menuData);
        console.log('Меню успешно синхронизировано с Firebase');
    } catch (error) {
        console.error('Ошибка синхронизации меню:', error);
    }
}

syncMenu();