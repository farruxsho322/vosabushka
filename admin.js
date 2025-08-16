// Инициализация Firebase через backend, но для auth используем client-side
const firebaseConfig = {}; // Конфиг перемещён в backend, используем только auth
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Проверка авторизации
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'vasabushka.html'; // Или страница логина
    } else {
        checkAdminRole(user);
    }
});

async function checkAdminRole(user) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists && userDoc.data().role === 'admin') {
        loadDishes();
    } else {
        alert('Доступ запрещён');
        auth.signOut();
    }
}

// Валидация формы
function validateDishForm() {
    const name = document.getElementById('dish-name').value.trim();
    const description = document.getElementById('dish-description').value.trim();
    const price = document.getElementById('dish-price').value;
    const imageUrl = document.getElementById('dish-image-url').value.trim();
    const category = document.getElementById('dish-category').value;
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif))$/i;

    if (!name || !description || !price || !imageUrl || !category) {
        alert('Заполните все обязательные поля.');
        return false;
    }
    if (isNaN(price) || price <= 0) {
        alert('Цена должна быть положительным числом.');
        return false;
    }
    if (!urlPattern.test(imageUrl)) {
        alert('Введите корректный URL изображения.');
        return false;
    }
    return true;
}

// Сохранение блюда
document.getElementById('save-dish-btn').addEventListener('click', async () => {
    if (!validateDishForm()) return;

    const saveBtn = document.getElementById('save-dish-btn');
    const loading = document.getElementById('loading-indicator');
    saveBtn.disabled = true;
    loading.style.display = 'block';

    const dishData = {
        name: document.getElementById('dish-name').value,
        description: document.getElementById('dish-description').value,
        price: parseFloat(document.getElementById('dish-price').value),
        imageUrl: document.getElementById('dish-image-url').value,
        category: document.getElementById('dish-category').value,
        discount: parseInt(document.getElementById('dish-discount').value) || 0,
        top: document.getElementById('dish-top').checked
    };

    try {
        await fetch('/api/dish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dishData) });
        loadDishes();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// Загрузка блюд
let dishes = [];
let currentPage = 1;
const dishesPerPage = 10;

async function loadDishes() {
    const response = await fetch('/api/menu');
    dishes = await response.json();
    filterAndRenderDishes();
}

function filterAndRenderDishes() {
    const category = document.getElementById('category-filter').value;
    const search = document.getElementById('dish-search').value.toLowerCase();

    const filtered = dishes.filter(d => 
        (category ? d.category === category : true) &&
        (d.name.toLowerCase().includes(search) || d.description.toLowerCase().includes(search))
    );

    const start = (currentPage - 1) * dishesPerPage;
    const paginated = filtered.slice(start, start + dishesPerPage);

    document.getElementById('dish-list').innerHTML = paginated.map(d => `
        <div>${d.name} - ${d.category} - ${d.price} руб. <button onclick="editDish('${d.id}')">Редактировать</button></div>
    `).join('');

    document.getElementById('page-info').textContent = `Страница ${currentPage} из ${Math.ceil(filtered.length / dishesPerPage)}`;
}

// События для фильтров и пагинации
document.getElementById('category-filter').addEventListener('change', () => { currentPage = 1; filterAndRenderDishes(); });
document.getElementById('dish-search').addEventListener('input', () => { currentPage = 1; filterAndRenderDishes(); });
document.getElementById('prev-page').addEventListener('click', () => { if (currentPage > 1) currentPage--; filterAndRenderDishes(); });
document.getElementById('next-page').addEventListener('click', () => { currentPage++; filterAndRenderDishes(); });

// Функция редактирования (пример, доработайте по необходимости)
function editDish(id) {
    const dish = dishes.find(d => d.id === id);
    if (dish) {
        document.getElementById('dish-name').value = dish.name;
        // Заполните другие поля аналогично
        // Сохраните с PUT запросом на /api/dish/:id
    }
}