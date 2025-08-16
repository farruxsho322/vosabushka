require('dotenv').config();
const express = require('express');
const axios = require('axios');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-service-account.json'))
});

const app = express();
const db = admin.firestore();

app.use(express.json());

// Получение меню
app.get('/api/menu', async (req, res) => {
    try {
        const snapshot = await db.collection('dishes').get();
        const dishes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(dishes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Сохранение блюда
app.post('/api/dish', async (req, res) => {
    try {
        await db.collection('dishes').add(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Отправка заказа в FrontPad
app.post('/api/order', async (req, res) => {
    const { name, phone, email, orderType } = req.body;

    if (!name || !phone || !email || !orderType) {
        return res.status(400).json({ error: 'Обязательные поля не заполнены' });
    }
    if (!/^\+7\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Неверный формат телефона' });
    }

    try {
        // Пример отправки в FrontPad (замените URL и параметры)
        const response = await axios.post('https://api.frontpad.ru/orders', {
            ...req.body,
            secret: process.env.FRONTPAD_SECRET
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка отправки заказа' });
    }
});

app.listen(3000, () => console.log('Сервер запущен на порту 3000'));