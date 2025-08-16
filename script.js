import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getDatabase, ref, set, get, push } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyArNwWVEkN9dkNJGFKchvZEx81HxjbVMbE",
  authDomain: "vasabushka-new.firebaseapp.com",
  databaseURL: "https://vasabushka-new-default-rtdb.firebaseio.com",
  projectId: "vasabushka-new",
  storageBucket: "vasabushka-new.firebasestorage.app",
  messagingSenderId: "788978771687",
  appId: "1:788978771687:web:bc15aac8721335479da442"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let cart = [];
let isAuthenticated = false;
let carouselIndex = 0;
const slides = document.getElementsByClassName('carousel-slide');
const categories = document.getElementsByClassName('category');
const ordersRef = ref(db, 'orders');

// Сохранение и загрузка последнего адреса из localStorage
let lastAddress = JSON.parse(localStorage.getItem('lastAddress')) || {};

function updateAuthStatus() {
    console.log('Обновление статуса авторизации:', isAuthenticated);
    const authButtons = document.getElementById('auth-buttons');
    const authStatus = document.getElementById('auth-status');
    const checkoutSection = document.getElementById('checkout');
    if (authButtons && authStatus) {
        if (isAuthenticated) {
            authButtons.style.display = 'none';
            authStatus.innerHTML = '<span class="label label--solid">Авторизован</span>';
            if (cart.length > 0 && checkoutSection) {
                checkoutSection.style.display = 'block';
                checkoutSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            authButtons.style.display = 'flex';
            authStatus.innerHTML = '';
            if (checkoutSection) checkoutSection.style.display = 'none';
        }
    } else {
        console.error('Элементы authButtons или authStatus не найдены');
    }
}

function showSignInModal() {
    console.log('Кнопка Sign In нажата');
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.style.display = 'flex';
    } else {
        console.error('Модальное окно входа не найдено');
        alert('Ошибка: модальное окно входа не найдено.');
    }
}

function showSignUpModal() {
    console.log('Кнопка Sign Up нажата');
    const signupModal = document.getElementById('signup-modal');
    if (signupModal) {
        signupModal.style.display = 'flex';
    } else {
        console.error('Модальное окно регистрации не найдено');
        alert('Ошибка: модальное окно регистрации не найдено.');
    }
}

function closeAuthModal() {
    console.log('Закрытие модального окна входа');
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.style.display = 'none';
    }
}

function closeSignUpModal() {
    console.log('Закрытие модального окна регистрации');
    const signupModal = document.getElementById('signup-modal');
    if (signupModal) {
        signupModal.style.display = 'none';
    }
}

async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        console.log('Попытка входа через Gmail...');
        const result = await signInWithPopup(auth, provider);
        isAuthenticated = true;
        closeAuthModal();
        console.log('Успешный вход:', result.user.email);
        alert('Успешный вход через Gmail!');
        updateAuthStatus();
        const checkoutSection = document.getElementById('checkout');
        if (checkoutSection && cart.length > 0) {
            checkoutSection.style.display = 'block';
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Ошибка входа через Gmail:', error.code, error.message);
        alert('Ошибка входа через Gmail: ' + error.message);
    }
}

async function signUpWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        console.log('Попытка регистрации через Gmail...');
        const result = await signInWithPopup(auth, provider);
        isAuthenticated = true;
        closeSignUpModal();
        console.log('Успешная регистрация:', result.user.email);
        alert('Успешная регистрация через Gmail!');
        updateAuthStatus();
    } catch (error) {
        console.error('Ошибка регистрации через Gmail:', error.code, error.message);
        alert('Ошибка регистрации через Gmail: ' + error.message);
    }
}

async function showAuthModal() {
    console.log('Кнопка Оформить заказ нажата');
    if (cart.length === 0) {
        alert('Корзина пуста! Добавьте товары.');
        return;
    }
    if (!isAuthenticated) {
        showSignInModal();
        return;
    }
    const checkoutSection = document.getElementById('checkout');
    if (checkoutSection) {
        const inputs = {
            street: document.getElementById('street'),
            home: document.getElementById('home'),
            apart: document.getElementById('apart'),
            pod: document.getElementById('pod'),
            et: document.getElementById('et')
        };
        // Проверка последнего адреса
        if (lastAddress.street && lastAddress.home) {
            if (confirm(`Использовать предыдущий адрес: ${lastAddress.street}, ${lastAddress.home}${lastAddress.apart ? ', кв. ' + lastAddress.apart : ''}?`)) {
                inputs.street.value = lastAddress.street || '';
                inputs.home.value = lastAddress.home || '';
                inputs.apart.value = lastAddress.apart || '';
                inputs.pod.value = lastAddress.pod || '';
                inputs.et.value = lastAddress.et || '';
            }
        }
        checkoutSection.style.display = 'block';
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error('Секция checkout не найдена');
        alert('Ошибка: секция оформления заказа не найдена.');
    }
}

async function loadMenu() {
    try {
        console.log('Попытка подключения к Firebase...');
        const snapshot = await get(ref(db, 'menu'));
        const menuData = snapshot.val();
        if (!menuData) {
            console.warn('Меню пусто или данные отсутствуют');
            document.querySelectorAll('.category').forEach(cat => {
                cat.innerHTML = '<p>Меню временно недоступно</p>';
            });
            return;
        }
        for (const categoryId in menuData) {
            const category = document.getElementById(categoryId);
            if (!category) {
                console.error(`Категория ${categoryId} не найдена в DOM`);
                continue;
            }
            category.innerHTML = '';
            const items = Object.values(menuData[categoryId] || {});
            if (items.length === 0) {
                category.innerHTML += '<p>Товары в этой категории отсутствуют</p>';
                continue;
            }
            items.forEach((item) => {
                if (!item.id || !item.name || !item.price || !item.image) {
                    console.warn(`Некорректные данные для блюда: ${JSON.stringify(item)}`);
                    return;
                }
                let iconPosition = 0.6;
                let iconsHtml = '';
                if (item.topSelling) {
                    iconsHtml += `
                        <svg class="fire-icon" style="right: ${iconPosition}rem" viewBox="0 0 24 24"><path d="M12 23c-1.1 0-2-.9-2-2 0-.7.4-1.3 1-1.7V16c-1.7.3-3-1.1-3-2.8 0-1.3.9-2.3 2-2.8V7c-1.7.3-3-1.1-3-2.8 0-1.7 1.3-3.1 3-3.3V2c0 1.1.9 2 2 2s2-.9 2-2v1.2c1.7.2 3 1.6 3 3.3 0 1.7-1.3 3.1-3 2.8v3.4c1.1.5 2 1.5 2 2.8 0 1.7-1.3 3.1-3 2.8v3.3c.6.4 1 1.7 1 1.7 0 1.1-.9 2-2 2z"/></svg>
                        <span class="icon-label fire-label" style="right: ${iconPosition - 0.3}rem">Hot</span>
                    `;
                }
                if (item.discount > 0) {
                    iconPosition += 1.8;
                    iconsHtml += `
                        <svg class="discount-icon" style="right: ${iconPosition}rem" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91a6.991 6.991 0 0 1-4.76-2.59l1.43-1.43c1.03.79 2.16 1.33 3.33 1.33 1.54 0 2.82-1.09 2.82-2.5 0-1.41-1.28-2.5-2.82-2.5-1.17 0-2.29.54-3.33 1.33l-1.43-1.43a6.991 6.991 0 0 1 4.76-2.59V4h2.82v1.91a6.991 6.991 0 0 1 4.76 2.59l-1.43 1.43c-1.03-.79-2.16-1.33-3.33-1.33-1.54 0-2.82 1.09-2.82 2.5 0 1.41 1.28 2.5 2.82 2.5 1.17 0 2.29-.54 3.33-1.33l1.43 1.43a6.991 0 0 1-4.76 2.59z"/></svg>
                        <span class="icon-label discount-label" style="right: ${iconPosition - 0.3}rem">Скидка</span>
                    `;
                }
                const itemHtml = `
                    <div class="menu-item">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        ${iconsHtml}
                        <h3>${item.name}</h3>
                        <p>${item.description || ''}</p>
                        <p>Цена: ${item.price} руб.</p>
                        <button onclick="addToCart('${item.id}', '${item.name}', ${item.price})">В корзину</button>
                    </div>`;
                category.innerHTML += itemHtml;
            });
        }
        showCategory('rolls');
    } catch (error) {
        console.error('Ошибка загрузки меню:', error.code, error.message);
        alert('Ошибка загрузки меню: ' + error.message);
        document.querySelectorAll('.category').forEach(cat => {
            cat.innerHTML = '<p>Ошибка загрузки меню. Попробуйте позже.</p>';
        });
    }
}

function addToCart(id, name, price) {
    console.log(`Добавление в корзину: ${name}`);
    if (!id || !name || !price) {
        console.error('Некорректные данные для добавления в корзину:', { id, name, price });
        alert('Ошибка: товар не может быть добавлен в корзину из-за некорректных данных.');
        return;
    }
    let item = cart.find(i => i.id === id);
    if (item) {
        item.qty++;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    updateCart();
}

function changeQuantity(id, delta) {
    console.log(`Изменение количества для id ${id}: ${delta}`);
    let item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        updateCart();
    }
}

function removeItem(id) {
    console.log(`Удаление товара с id ${id}`);
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

function updateCart() {
    console.log('Обновление корзины');
    let html = '<ul>';
    let total = 0;
    let itemCount = 0;
    cart.forEach(item => {
        let itemTotal = item.price * item.qty;
        html += `<li>${item.name} (${item.price} руб.) x ${item.qty} = ${itemTotal} руб. <button onclick="changeQuantity('${item.id}', 1)">+</button><button onclick="changeQuantity('${item.id}', -1)">-</button><button class="remove" onclick="removeItem('${item.id}')">Удалить</button></li>`;
        total += itemTotal;
        itemCount += item.qty;
    });
    html += `</ul><p>Всего: ${itemCount} товар(ов), ${total} руб.</p>`;
    const cartElement = document.getElementById('cart');
    if (cartElement) {
        cartElement.innerHTML = cart.length ? html : '<p>Корзина пуста</p>';
    } else {
        console.error('Элемент корзины не найден');
    }
}

async function submitOrder() {
    console.log('Отправка заказа');
    if (!isAuthenticated) {
        alert('Пожалуйста, авторизуйтесь через Gmail для оформления заказа.');
        showSignInModal();
        return;
    }

    const inputs = {
        street: document.getElementById('street'),
        home: document.getElementById('home'),
        apart: document.getElementById('apart'),
        pod: document.getElementById('pod'),
        et: document.getElementById('et'),
        pay: document.getElementById('pay')
    };

    for (const [key, element] of Object.entries(inputs)) {
        if (!element) {
            console.error(`Поле ${key} не найдено`);
            alert(`Ошибка: поле ${key} не найдено.`);
            return;
        }
        if (element.hasAttribute('required') && !element.value.trim()) {
            alert(`Пожалуйста, заполните поле ${key}`);
            element.focus();
            return;
        }
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) {
        console.error('Форма оформления заказа не найдена');
        alert('Ошибка: форма оформления заказа не найдена.');
        return;
    }

    // Сохранение последнего адреса
    const currentAddress = {
        street: inputs.street.value,
        home: inputs.home.value,
        apart: inputs.apart.value || '',
        pod: inputs.pod.value || '',
        et: inputs.et.value || ''
    };
    localStorage.setItem('lastAddress', JSON.stringify(currentAddress));

    const secret = 'DtaBG8NaBKh2se5RQd2BEZzrsh4DQf8eD8F87e8yRfh7kaN4eBsHiQ3D2R6D24Gn3akYeieZsnTFryyyYN67rTAbAsEih9B8aQTe225daNHr76KSGENZka2KtsYDsiAs2eAK6sR65ni2hYERneBDfnaBGZ427reYzEyrY9iQnyBze6ataDYfSZGkGAaEQekaKGryGB8ZYAf3thhtN6DsR9FkzFRaK5aiBsF7SESD43sh8DEKz64b5znr46';
    let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    let discount = 0;

    if (total >= 3000) {
        discount = total * 0.1;
        alert('Применена скидка 10% на доставку для заказа от 3000 руб.');
    } else if (inputs.pay.value === '2') {
        discount = total * 0.1;
        alert('Применена скидка 10% на самовывоз.');
    }

    let formData = new FormData();
    formData.append('secret', secret);
    formData.append('street', inputs.street.value || '');
    formData.append('home', inputs.home.value || '');
    formData.append('apart', inputs.apart.value || '');
    formData.append('pod', inputs.pod.value || '');
    formData.append('et', inputs.et.value || '');
    formData.append('pay', inputs.pay.value || '');
    formData.append('type', inputs.pay.value === '1' ? '1' : '2');

    cart.forEach((item, index) => {
        formData.append(`product[${index}]`, item.id);
        formData.append(`product_kol[${index}]`, item.qty);
    });

    console.log('Отправка заказа в FrontPad...', Array.from(formData.entries()));
    try {
        const response = await fetch('https://app.frontpad.ru/api/index.php?new_order', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Ответ от FrontPad:', result);
        if (result.result === 'success') {
            const orderId = result.order_id || `ORD-${Date.now()}`;
            const orderTime = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Novosibirsk' });
            const order = {
                id: orderId,
                items: cart,
                total: total - discount,
                discount,
                address: currentAddress,
                payment: inputs.pay.value,
                timePlaced: orderTime,
                status: 'Обработка'
            };
            await set(push(ordersRef), order);
            alert(`Заказ #${orderId} успешно отправлен!`);
            cart = [];
            updateCart();
            checkoutForm.reset();
            const checkoutSection = document.getElementById('checkout');
            if (checkoutSection) checkoutSection.style.display = 'none';
            const orderStatus = document.getElementById('order-status');
            if (orderStatus) {
                orderStatus.style.display = 'block';
                document.getElementById('status-text').textContent = `Статус: ${order.status}`;
            }
            updateOrders();
        } else {
            console.error('Ошибка FrontPad:', result.error || 'Неизвестная ошибка');
            alert('Ошибка: ' + (result.error || 'Неизвестная ошибка сервера.'));
        }
    } catch (error) {
        console.error('Ошибка отправки заказа:', error);
        alert('Ошибка отправки заказа: ' + error.message);
        if (confirm('Заказ может быть отправлен, несмотря на ошибку. Очистить корзину?')) {
            cart = [];
            updateCart();
            checkoutForm.reset();
            const checkoutSection = document.getElementById('checkout');
            if (checkoutSection) checkoutSection.style.display = 'none';
            updateOrders();
        }
    }
}

function updateOrders() {
    get(ordersRef).then((snapshot) => {
        const orders = snapshot.val() || {};
        const orderNav = document.getElementById('order-nav');
        if (orderNav) {
            orderNav.innerHTML = '<h3>Ваши заказы:</h3>';
            Object.values(orders).forEach(order => {
                orderNav.innerHTML += `<a href="#" onclick="showOrderDetails('${order.id}')">${order.id} (${order.status})</a><br>`;
            });
        } else {
            console.error('Элемент order-nav не найден');
        }
    });
}

function showOrderDetails(orderId) {
    get(ref(db, `orders/${orderId}`)).then((snapshot) => {
        const order = snapshot.val();
        if (order) {
            alert(`Заказ #${order.id}\nВремя: ${order.timePlaced}\nСтатус: ${order.status}\nИтог: ${order.total} руб.\nАдрес: ${order.address.street}, ${order.address.home}${order.address.apart ? ', кв. ' + order.address.apart : ''}`);
        } else {
            alert('Заказ не найден');
        }
    });
}

function confirmRegion() {
    const regionSection = document.getElementById('region-select');
    if (regionSection) regionSection.style.display = 'none';
}

function showCategory(categoryId) {
    Array.from(categories).forEach(cat => cat.classList.remove('active'));
    Array.from(document.querySelectorAll('.sidebar a')).forEach(a => a.classList.remove('active'));
    const category = document.getElementById(categoryId);
    const link = document.querySelector(`.sidebar a[onclick*="${categoryId}"]`);
    if (category) {
        category.classList.add('active');
        category.scrollIntoView({ behavior: 'smooth' });
    }
    if (link) link.classList.add('active');
}

function nextSlide() {
    slides[carouselIndex].classList.remove('active');
    carouselIndex = (carouselIndex + 1) % slides.length;
    slides[carouselIndex].classList.add('active');
}

setInterval(nextSlide, 8000);
if (slides.length > 0) slides[0].classList.add('active');

document.getElementById('auth-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) closeAuthModal();
});
document.getElementById('signup-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) closeSignUpModal();
});

onAuthStateChanged(auth, (user) => {
    isAuthenticated = !!user;
    console.log('Состояние авторизации изменилось:', isAuthenticated, user ? user.email : 'Нет пользователя');
    updateAuthStatus();
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');
    loadMenu();
    updateOrders();
    updateAuthStatus();
    // Инициализация формы с последним адресом
    const inputs = {
        street: document.getElementById('street'),
        home: document.getElementById('home'),
        apart: document.getElementById('apart'),
        pod: document.getElementById('pod'),
        et: document.getElementById('et')
    };
    if (lastAddress.street && lastAddress.home) {
        inputs.street.value = lastAddress.street || '';
        inputs.home.value = lastAddress.home || '';
        inputs.apart.value = lastAddress.apart || '';
        inputs.pod.value = lastAddress.pod || '';
        inputs.et.value = lastAddress.et || '';
    }
});

window.confirmRegion = confirmRegion;
window.showCategory = showCategory;
window.showSignInModal = showSignInModal;
window.showSignUpModal = showSignUpModal;
window.showAuthModal = showAuthModal;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;
window.submitOrder = submitOrder;
window.signInWithGoogle = signInWithGoogle;
window.signUpWithGoogle = signUpWithGoogle;
window.showOrderDetails = showOrderDetails;

// Функция отмены заказа (примерная реализация)
function cancelOrder() {
    const orderStatus = document.getElementById('order-status');
    const statusText = document.getElementById('status-text');
    if (orderStatus && statusText && statusText.textContent.includes('Обработка')) {
        if (confirm('Вы уверены, что хотите отменить заказ?')) {
            statusText.textContent = 'Статус: Отменён';
            document.getElementById('cancel-order-btn').style.display = 'none';
            document.getElementById('support-text').style.display = 'block';
        }
    } else {
        alert('Заказ нельзя отменить в текущем статусе.');
    }
}