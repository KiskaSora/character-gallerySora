// Управление персонажами
let characters = [];
let displayedCount = 0;
const LOAD_COUNT = 6; // Сколько карточек загружать за раз

// Загрузка данных из localStorage при старте
window.addEventListener('load', () => {
    loadCharacters();
    displayCharacters();
    createSakuraPetals();
});

// Загрузка персонажей из localStorage
function loadCharacters() {
    const stored = localStorage.getItem('characters');
    if (stored) {
        characters = JSON.parse(stored);
    }
}

// Сохранение персонажей в localStorage
function saveCharacters() {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// Открытие/закрытие админ-панели
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
const closeAdmin = document.getElementById('closeAdmin');

adminToggle.addEventListener('click', () => {
    adminPanel.classList.add('active');
});

closeAdmin.addEventListener('click', () => {
    adminPanel.classList.remove('active');
});

// Предпросмотр изображения
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            imagePreview.src = reader.result;
            imagePreview.classList.add('active');
        });
        reader.readAsDataURL(file);
    }
});

// Добавление персонажа
const characterForm = document.getElementById('characterForm');

characterForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const file = imageInput.files[0];
    const name = document.getElementById('characterName').value;
    const desc = document.getElementById('characterDesc').value;

    if (file && name && desc) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            // Создаём объект персонажа
            const character = {
                id: Date.now(),
                image: reader.result, // Data URL изображения
                name: name,
                description: desc
            };

            // Добавляем в массив и сохраняем
            characters.unshift(character); // Добавляем в начало
            saveCharacters();

            // Перезагружаем галерею
            displayedCount = 0;
            document.getElementById('gallery').innerHTML = '';
            displayCharacters();

            // Очищаем форму
            characterForm.reset();
            imagePreview.classList.remove('active');

            // Закрываем админку
            adminPanel.classList.remove('active');

            alert('✓ Персонаж добавлен!');
        });
        reader.readAsDataURL(file);
    }
});

// Отображение персонажей (порциями для бесконечной прокрутки)
function displayCharacters() {
    const gallery = document.getElementById('gallery');
    const endIndex = Math.min(displayedCount + LOAD_COUNT, characters.length);

    for (let i = displayedCount; i < endIndex; i++) {
        const char = characters[i];
        const card = createCharacterCard(char);
        gallery.appendChild(card);
    }

    displayedCount = endIndex;

    // Скрываем индикатор загрузки если все показаны
    if (displayedCount >= characters.length) {
        document.getElementById('loading').classList.remove('active');
    }
}

// Создание карточки персонажа
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.id = character.id;

    card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="character-image">
        <div class="card-overlay">
            <div class="overlay-content">
                <h2 class="character-name">${character.name}</h2>
                <p class="character-desc">${character.description}</p>
                <button class="download-btn" onclick="downloadImage(${character.id})">
                    <span>⬇</span> Скачать
                </button>
            </div>
        </div>
    `;

    return card;
}

// Функция скачивания изображения
function downloadImage(characterId) {
    const character = characters.find(c => c.id === characterId);
    if (character) {
        const link = document.createElement('a');
        link.href = character.image;
        link.download = character.name.replace(/\s+/g, '_') + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Бесконечная прокрутка
let isLoading = false;

window.addEventListener('scroll', () => {
    // Проверяем, достиг ли пользователь низа страницы
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100) {
        if (!isLoading && displayedCount < characters.length) {
            isLoading = true;
            document.getElementById('loading').classList.add('active');

            // Задержка для эффекта загрузки
            setTimeout(() => {
                displayCharacters();
                isLoading = false;

                if (displayedCount >= characters.length) {
                    document.getElementById('loading').classList.remove('active');
                }
            }, 500);
        }
    }
});

// Удаление всех персонажей
document.getElementById('clearAll').addEventListener('click', () => {
    if (confirm('⚠️ Удалить всех персонажей? Это действие нельзя отменить!')) {
        characters = [];
        displayedCount = 0;
        saveCharacters();
        document.getElementById('gallery').innerHTML = '';
        alert('✓ Все персонажи удалены');
    }
});

// Создание падающих лепестков сакуры
function createSakuraPetals() {
    const container = document.getElementById('sakuraContainer');
    const petalCount = 25;

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('sakura-petal');

        const leftPosition = Math.random() * 100;
        const animationDuration = 8 + Math.random() * 10;
        const animationDelay = Math.random() * 5;
        const size = 10 + Math.random() * 10;

        petal.style.left = leftPosition + '%';
        petal.style.animationDuration = animationDuration + 's';
        petal.style.animationDelay = animationDelay + 's';
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';

        container.appendChild(petal);
    }
}
